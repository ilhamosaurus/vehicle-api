import { z } from 'zod';

export const UpdateBrandSchema = z.object({
  brand: z.string().min(1, { message: 'Brand must not be empty' }),
});

export type UpdateBrandDto = z.infer<typeof UpdateBrandSchema>;
