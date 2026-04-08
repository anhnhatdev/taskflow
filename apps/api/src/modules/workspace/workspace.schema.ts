import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
