import { z } from 'zod';

export const CreateVehicleSchema = z.object({
  brand: z.string().min(1, { message: 'Brand must not be empty' }),
  type: z.string().min(1, { message: 'Type must not be empty' }),
  model: z.string().min(1, { message: 'Model must not be empty' }),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  price: z
    .number()
    .positive('Price must be positive value')
    .max(999999999999.99, {
      message: 'Price must be less than 999,999,999,999.99',
    }),
});

export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
