import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  identifier: z.string().min(2).max(10).toUpperCase(), // e.g. "TF"
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
