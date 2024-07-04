import { z } from 'zod';

export const UpdateModelSchema = z.object({
  model: z.string().min(1, { message: 'Model must not be empty' }),
});

export type UpdateModelDto = z.infer<typeof UpdateModelSchema>;
