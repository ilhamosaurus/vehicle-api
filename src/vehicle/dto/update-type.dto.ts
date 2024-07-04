import { z } from 'zod';

export const UpdateTypeSchema = z.object({
  type: z.string().min(1, { message: 'Type must not be empty' }),
});

export type UpdateTypeDto = z.infer<typeof UpdateTypeSchema>;
