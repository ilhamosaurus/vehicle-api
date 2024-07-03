import { z } from 'zod';

export const UpdatePriceSchema = z.object({
  code: z.string().min(8, { message: 'Code must be at least 8 characters' }),
  price: z
    .number()
    .positive('Price must be positive value')
    .max(999999999999.99, {
      message: 'Price must be less than 999,999,999,999.99',
    }),
});

export type UpdatePriceDto = z.infer<typeof UpdatePriceSchema>;
