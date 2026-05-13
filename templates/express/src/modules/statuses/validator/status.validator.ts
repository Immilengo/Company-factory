import { z } from 'zod';

export const createStatusSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional()
});

export const patchStatusSchema = z
  .object({
    code: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    active: z.boolean().optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field must be sent' });
