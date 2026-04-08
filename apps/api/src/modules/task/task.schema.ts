import { z } from 'zod';

export const taskStatusSchema = z.enum([
  'BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'
]);

export const taskPrioritySchema = z.enum([
  'URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NO_PRIORITY'
]);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: taskStatusSchema.default('BACKLOG'),
  priority: taskPrioritySchema.default('NO_PRIORITY'),
  estimateHours: z.number().optional(),
  dueDate: z.string().datetime().optional(),
  sprintId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const moveTaskSchema = z.object({
  status: taskStatusSchema,
  sortOrder: z.number(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
