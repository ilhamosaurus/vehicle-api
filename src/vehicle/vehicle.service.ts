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
  UpdateModelDto,
  UpdatePriceDto,
  UpdateTypeDto,
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
          : await tx.vehicle_brand.create({
              data: { name: data.brand.toUpperCase() },
            });
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
                name: data.model.toUpperCase(),
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

  async getAllPricelists(pageNumber?: string, pageSize?: string) {
    if (pageNumber && pageSize) {
      const skip = (parseInt(pageNumber) - 1) * parseInt(pageSize);
      const take = parseInt(pageSize);
      const pricelists = await this.prisma.pricelist.findMany({
        select: {
          code: true,
          price: true,
        },
        skip,
        take,
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
          currentPage: parseInt(pageNumber),
          pageSize: pricelists.length < take ? pricelists.length : take,
        })),
      };
    }
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
    if (filter.pageSize && filter.pageNumber) {
      const skip =
        (parseInt(filter.pageNumber) - 1) * parseInt(filter.pageSize);
      const take = parseInt(filter.pageSize);
      const prices = await this.prisma.pricelist.findMany({
        where: {
          OR: [
            {
              model: { name: { contains: filter.model, mode: 'insensitive' } },
            },
            {
              year: { year: filter.year ? parseInt(filter.year) : undefined },
            },
            {
              AND: [
                {
                  year: {
                    year: filter.year ? parseInt(filter.year) : undefined,
                  },
                  model: {
                    name: { contains: filter.model, mode: 'insensitive' },
                  },
                },
              ],
            },
          ],
        },
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
            },
          },
        },
        skip,
        take,
      });

      if (!prices || prices.length === 0) {
        throw new NotFoundException(`No data found`, {
          cause: new Error(),
          description: 'No data found',
        });
      }

      return prices.map((price) => ({
        model: filter.model
          ? filter.model.charAt(0).toUpperCase() + filter.model.slice(1)
          : null,
        year: filter.year ? parseInt(filter.year) : null,
        code: price.code,
        price: Number(price.price),
      }));
    }

    const prices = await this.prisma.pricelist.findMany({
      where: {
        OR: [
          { model: { name: { contains: filter.model, mode: 'insensitive' } } },
          {
            year: { year: filter.year ? parseInt(filter.year) : undefined },
          },
          {
            AND: [
              {
                year: { year: filter.year ? parseInt(filter.year) : undefined },
                model: {
                  name: { contains: filter.model, mode: 'insensitive' },
                },
              },
            ],
          },
        ],
      },
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
          },
        },
      },
    });

    if (!prices || prices.length === 0) {
      throw new NotFoundException(`No data found`, {
        cause: new Error(),
        description: 'No data found',
      });
    }

    return prices.map((price) => ({
      model: filter.model
        ? filter.model.charAt(0).toUpperCase() + filter.model.slice(1)
        : null,
      year: filter.year ? parseInt(filter.year) : null,
      code: price.code,
      price: Number(price.price),
    }));
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

  async updateModel(id: string, dto: UpdateModelDto) {
    try {
      const exisitingModel = await this.prisma.vehicle_model.findUnique({
        where: { id },
      });

      if (!exisitingModel) {
        throw new NotFoundException(`Invalid id: ${id}`, {
          cause: new Error(),
          description: 'Invalid id',
        });
      }

      const updatedModel = await this.prisma.vehicle_model.update({
        where: { id },
        data: {
          name: dto.model.toUpperCase(),
        },
      });

      return updatedModel;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        `Failed to update model: ${error}`,
        {
          cause: new Error(),
          description: 'Failed to update model',
        },
      );
    }
  }

  async updateType(id: string, dto: UpdateTypeDto) {
    try {
      const existingType = await this.prisma.vehicle_type.findUnique({
        where: { id },
      });

      if (!existingType) {
        throw new NotFoundException(`Invalid id: ${id}`, {
          cause: new Error(),
          description: 'Invalid id',
        });
      }

      const updatedType = await this.prisma.vehicle_type.update({
        where: { id },
        data: {
          name: dto.type.toUpperCase(),
        },
      });

      return updatedType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        `Failed to update type: ${error}`,
        {
          cause: new Error(),
          description: 'Failed to update type',
        },
      );
    }
  }

  async deletePricelist(code: string) {
    try {
      const existingPrice = await this.prisma.pricelist.findUnique({
        where: { code },
      });

      if (!existingPrice) {
        throw new NotFoundException(`Invalid code: ${code}`, {
          cause: new Error(),
          description: 'Invalid code',
        });
      }

      await this.prisma.pricelist.delete({
        where: { code },
      });

      return {
        status: HttpStatus.OK,
        message: 'Price deleted successfully',
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
}
