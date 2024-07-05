import * as bcrypt from 'bcryptjs';
import user from './static/user';
import vehicles from './static/vehicles';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createUser = async () => {
  const createdUsers = await prisma.$transaction(async (tx) => {
    const result = [];
    for (const u of user) {
      const hashedPassword = await bcrypt.hash(u.password, 10);

      const createdUser = await tx.user.create({
        data: {
          name: u.name,
          password: hashedPassword,
          isAdmin: u.isAdmin,
        },
      });

      result.push(createdUser);
    }

    return result;
  });

  console.log('createdUsers: ', createdUsers);
};

const createVehicels = async () => {
  const createdVehicels = await prisma.$transaction(async (tx) => {
    for (const vehicle of vehicles) {
      const brand = (await tx.vehicle_brand.findFirst({
        where: { name: { contains: vehicle.brand, mode: 'insensitive' } },
      }))
        ? await tx.vehicle_brand.findFirst({
            where: {
              name: {
                contains: vehicle.brand,
                mode: 'insensitive',
              },
            },
          })
        : await tx.vehicle_brand.create({
            data: { name: vehicle.brand.toUpperCase() },
          });
      const type = (await tx.vehicle_type.findFirst({
        where: {
          name: { contains: vehicle.type, mode: 'insensitive' },
          brand_id: brand.id,
        },
      }))
        ? await tx.vehicle_type.findFirst({
            where: {
              name: { contains: vehicle.type, mode: 'insensitive' },
              brand_id: brand.id,
            },
          })
        : await tx.vehicle_type.create({
            data: {
              name:
                vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1),
              brand_id: brand.id,
            },
          });
      const model = (await tx.vehicle_model.findFirst({
        where: {
          name: { contains: vehicle.model, mode: 'insensitive' },
          type_id: type.id,
        },
      }))
        ? await tx.vehicle_model.findFirst({
            where: {
              name: { contains: vehicle.model, mode: 'insensitive' },
              type_id: type.id,
            },
          })
        : await tx.vehicle_model.create({
            data: {
              name: vehicle.model.toUpperCase(),
              type_id: type.id,
            },
          });
      const year = (await tx.vehicle_year.findFirst({
        where: { year: vehicle.year },
      }))
        ? await tx.vehicle_year.findFirst({ where: { year: vehicle.year } })
        : await tx.vehicle_year.create({ data: { year: vehicle.year } });

      const count = await tx.pricelist.count();
      const priceCode = `${brand.name}-${model.name}${year.year}-${(count + 1).toString().padStart(3, '0')}`;
      const createdVehicle = await tx.pricelist.create({
        data: {
          year_id: year.id,
          model_id: model.id,
          code: priceCode,
          price: vehicle.price,
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

      const result = {
        brand: createdVehicle.model.type.brand.name,
        type: createdVehicle.model.type.name,
        model: createdVehicle.model.name,
        year: createdVehicle.year.year,
        price: Number(createdVehicle.price),
        code: createdVehicle.code,
      };

      console.log('result: ', result);
    }
  });

  console.log('createdVehicels: ', createdVehicels);
};

const main = async () => {
  await createUser();
  await createVehicels();
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
