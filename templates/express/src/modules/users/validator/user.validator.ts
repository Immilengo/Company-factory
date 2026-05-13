import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  statusId: z.string().uuid().optional()
});

export const updateUserSchema = z
  .object({
    fullName: z.string().min(3).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    statusId: z.string().uuid().optional(),
    active: z.boolean().optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field must be sent' });

export const addUserRoleSchema = z.object({
  roleName: z.string().min(1)
});

export const profileImageSchema = z.object({
  url: z.string().url(),
  fileName: z.string().optional(),
  contentType: z.string().optional(),
  sizeBytes: z.number().int().positive().optional(),
  sortOrder: z.number().int().optional()
});
