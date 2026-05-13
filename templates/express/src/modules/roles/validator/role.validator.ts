import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export const patchRoleSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    active: z.boolean().optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field must be sent' });
