import { z } from 'zod';

export const createImageSchema = z.object({
  url: z.string().url(),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  primaryImage: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});
