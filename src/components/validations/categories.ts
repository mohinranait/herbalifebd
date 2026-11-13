
import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  parentId: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  status: z.boolean().default(true),
  priority: z.union([z.number(), z.string().transform((v) => (v ? parseInt(v, 10) : 0))]).optional().nullable(),
});

export type TCategoryFormData = z.infer<typeof categorySchema>;
