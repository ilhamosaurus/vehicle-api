import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateVehicleDto,
  GetPriceDto,
  UpdateBrandDto,
  UpdatePriceDto,
} from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  async createVehicle(data: CreateVehicleDto) {
    try {
      const count = await this.prisma.pricelist.count();
      const createdVehicle = await this.prisma.$transaction(async (tx) => {
        const brand = (await tx.vehicle_brand.findFirst({
          where: { name: { contains: data.brand, mode: 'insensitive' } },
        }))
          ? await tx.vehicle_brand.findFirst({
              where: { name: { contains: data.brand, mode: 'insensitive' } },
            })
          : await tx.vehicle_brand.create({ data: { name: data.brand } });
        const type = (await tx.vehicle_type.findFirst({
          where: {
            name: { contains: data.type, mode: 'insensitive' },
            brand_id: brand.id,
          },
        }))
          ? await tx.vehicle_type.findFirst({
              where: {
                name: { contains: data.type, mode: 'insensitive' },
                brand_id: brand.id,
              },
            })
          : await tx.vehicle_type.create({
              data: {
                name: data.type.charAt(0).toUpperCase() + data.type.slice(1),
                brand_id: brand.id,
              },
            });
        const model = (await tx.vehicle_model.findFirst({
          where: {
            name: { contains: data.model, mode: 'insensitive' },
            type_id: type.id,
          },
        }))
          ? await tx.vehicle_model.findFirst({
              where: {
                name: { contains: data.model, mode: 'insensitive' },
                type_id: type.id,
              },
            })
          : await tx.vehicle_model.create({
              data: {
                name: data.model.charAt(0).toUpperCase() + data.model.slice(1),
                type_id: type.id,
              },
            });
        const year = (await tx.vehicle_year.findFirst({
          where: { year: data.year },
        }))
          ? await tx.vehicle_year.findFirst({ where: { year: data.year } })
          : await tx.vehicle_year.create({ data: { year: data.year } });

        const priceCode = `${brand.name}-${model.name}${year.year}-${(count + 1).toString().padStart(3, '0')}`;
        return tx.pricelist.create({
          data: {
            year_id: year.id,
            model_id: model.id,
            code: priceCode,
            price: data.price,
          },
          select: {
            price: true,
            code: true,
            year: {
              select: {
                year: true,
              },
            },
            model: {
              select: {
                name: true,
                type: {
                  select: {
                    name: true,
                    brand: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      });

      const result = {
        brand: createdVehicle.model.type.brand.name,
        type: createdVehicle.model.type.name,
        model: createdVehicle.model.name,
        year: createdVehicle.year.year,
        price: Number(createdVehicle.price),
        code: createdVehicle.code,
      };
      return {
        status: HttpStatus.CREATED,
        message: 'Vehicle created successfully',
        data: result,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `Failed to create vehicle: ${error}`,
      );
    }
  }

  async getPriceByCode(code: string) {
    try {
      const price = await this.prisma.pricelist.findUnique({
        where: { code },
        select: { price: true },
      });

      if (!price) {
        throw new NotFoundException(`Invalid code: ${code}`, {
          cause: new Error(),
          description: 'Invalid code',
        });
      }

      return {
        status: HttpStatus.OK,
        message: 'Price found successfully',
        data: {
          price: Number(price.price),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(`Failed to get price: ${error}`, {
        cause: new Error(),
        description: 'Failed to get price',
      });
    }
  }

  async getAllPricelists() {
    const pricelists = await this.prisma.pricelist.findMany({
      select: {
        code: true,
        price: true,
      },
    });

    if (!pricelists || pricelists.length === 0) {
      throw new NotFoundException('No pricelists found', {
        cause: new Error(),
        description: 'No pricelists found',
      });
    }

    return {
      status: HttpStatus.OK,
      message: 'All pricelists retrieved successfully',
      data: pricelists.map((pricelist) => ({
        code: pricelist.code,
        price: Number(pricelist.price),
      })),
    };
  }

  async getPriceByFilter(filter: GetPriceDto) {
    if (filter.year && filter.model) {
      const prices = await this.prisma.pricelist.findMany({
        where: {
          model: {
            name: {
              contains: filter.model,
              mode: 'insensitive',
            },
          },
          year: {
            year: parseInt(filter.year),
          },
        },
        select: {
          code: true,
          price: true,
        },
      });

      if (!prices || prices.length === 0) {
        throw new NotFoundException(
          `Invalid year and model: ${filter.year} & ${filter.model}`,
          {
            cause: new Error(),
            description: 'Invalid year and model',
          },
        );
      }

      return prices.map((price) => ({
        model: filter.model.charAt(0).toUpperCase() + filter.model.slice(1),
        year: parseInt(filter.year),
        code: price.code,
        price: Number(price.price),
      }));
    } else if (filter.model && !filter.year) {
      const prices = await this.prisma.vehicle_model.findMany({
        where: {
          name: {
            contains: filter.model,
            mode: 'insensitive',
          },
        },
        select: {
          name: true,
          Pricelist: {
            select: {
              code: true,
              price: true,
            },
          },
        },
      });

      if (!prices || prices.length === 0) {
        throw new NotFoundException(`Invalid model: ${filter.model}`, {
          cause: new Error(),
          description: 'Invalid model',
        });
      }

      const result: PriceByModel[] = prices.reduce((acc, entry) => {
        let modelEntry = acc.find((model) => model.model === entry.name);
        if (!modelEntry) {
          modelEntry = {
            model: entry.name,
            pricelist: entry.Pricelist.map((price) => ({
              code: price.code,
              price: Number(price.price),
            })),
          };

          acc.push(modelEntry);
        }

        entry.Pricelist.forEach((price) => {
          let codeEntry = modelEntry.pricelist?.find(
            (code) => code.code === price.code,
          );
          if (!codeEntry) {
            codeEntry = {
              code: price.code,
              price: Number(price.price),
            };
            modelEntry.pricelist?.push(codeEntry);
          }
        });
        return acc;
      }, [] as PriceByModel[]);

      return result;
    } else if (filter.year && !filter.model) {
      const prices = await this.prisma.vehicle_year.findMany({
        where: {
          year: parseInt(filter.year),
        },
        select: {
          year: true,
          Pricelist: {
            select: {
              code: true,
              price: true,
            },
          },
        },
      });

      if (!prices || prices.length === 0) {
        throw new NotFoundException(`Invalid year: ${filter.year}`, {
          cause: new Error(),
          description: 'Invalid year',
        });
      }

      return prices.map((price) => ({
        year: price.year,
        pricelist: price.Pricelist.map((price) => ({
          code: price.code,
          price: Number(price.price),
        })),
      }));
    }
  }

  async getVehicleDetail(code: string) {
    const vehicle = await this.prisma.pricelist.findUnique({
      where: { code },
      select: {
        code: true,
        price: true,
        year: {
          select: {
            year: true,
          },
        },
        model: {
          select: {
            name: true,
            type: {
              select: {
                name: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Invalid code: ${code}`, {
        cause: new Error(),
        description: 'Invalid code',
      });
    }

    return {
      brand: vehicle.model.type.brand.name,
      type: vehicle.model.type.name,
      model: vehicle.model.name,
      year: vehicle.year.year,
      price: Number(vehicle.price),
    };
  }

  async updateVehiclePrice(code: string, dto: UpdatePriceDto) {
    try {
      const existingPrice = await this.getPriceByCode(code);
      if (!existingPrice) {
        throw new NotFoundException(`Invalid code: ${code}`, {
          cause: new Error(),
          description: 'Invalid code',
        });
      }

      const updatedPrice = await this.prisma.pricelist.update({
        where: { code },
        data: {
          price: dto.price,
          code: dto.code,
        },
        select: {
          code: true,
          price: true,
          updatedAt: true,
        },
      });

      return updatedPrice;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Code already exists');
      }
      console.error(error);
      throw new InternalServerErrorException(`Failed to get price: ${error}`, {
        cause: new Error(),
        description: 'Failed to get price',
      });
    }
  }

  async updateBrand(id: string, dto: UpdateBrandDto) {
    try {
      const existingBrand = await this.prisma.vehicle_brand.findUnique({
        where: { id },
      });
      if (!existingBrand) {
        throw new NotFoundException(`Invalid id: ${id}`, {
          cause: new Error(),
          description: 'Invalid id',
        });
      }

      const updatedBrand = await this.prisma.vehicle_brand.update({
        where: { id },
        data: {
          name: dto.brand.toUpperCase(),
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });

      return updatedBrand;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        `Failed to update brand: ${error}`,
        {
          cause: new Error(),
          description: 'Failed to update brand',
        },
      );
    }
  }
}

type PriceByModel = {
  model: string;
  pricelist?: {
    code?: string;
    price?: number;
  }[];
};
