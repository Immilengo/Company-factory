import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1)
});

export const patchTicketSchema = z
  .object({
    subject: z.string().min(1).optional(),
    description: z.string().min(1).optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field must be sent' });

export const patchTicketStatusSchema = z.object({
  status: z.enum(['PENDENTE', 'PROCESSANDO', 'RESOLVIDO', 'FECHADO'])
});
