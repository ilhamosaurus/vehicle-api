import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVehicleDto } from './dto';

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

        const priceCode = `${brand.name}-${model.name}${year.year}-${count + 1}`;
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
        return null;
      }

      return {
        status: HttpStatus.OK,
        message: 'Price found successfully',
        data: {
          price: Number(price.price),
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(`Failed to get price: ${error}`);
    }
  }
}
