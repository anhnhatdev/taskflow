import { z } from 'zod';

export const startTimeLogSchema = z.object({
  taskId: z.string().uuid(),
  note: z.string().optional(),
});

export const stopTimeLogSchema = z.object({
  note: z.string().optional(),
});

export const manualTimeLogSchema = z.object({
  taskId: z.string().uuid(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  note: z.string().optional(),
});

export type StartTimeLogInput = z.infer<typeof startTimeLogSchema>;
export type StopTimeLogInput = z.infer<typeof stopTimeLogSchema>;
export type ManualTimeLogInput = z.infer<typeof manualTimeLogSchema>;
