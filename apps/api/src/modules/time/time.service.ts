import { prisma } from '../../index.js';
import { StartTimeLogInput, StopTimeLogInput, ManualTimeLogInput } from './time.schema.js';

export async function startTimeLog(userId: string, data: StartTimeLogInput) {
  // Check if there's an active timer
  const activeTimer = await prisma.timeLog.findFirst({
    where: { userId, endedAt: null }
  });

  if (activeTimer) {
    throw new Error('You already have an active timer running');
  }

  return prisma.timeLog.create({
    data: {
      ...data,
      userId,
      startedAt: new Date(),
    }
  });
}

export async function stopTimeLog(userId: string, data: StopTimeLogInput) {
  const activeTimer = await prisma.timeLog.findFirst({
    where: { userId, endedAt: null },
    orderBy: { startedAt: 'desc' }
  });

  if (!activeTimer) {
    throw new Error('No active timer found');
  }

  const endedAt = new Date();
  const durationMinutes = Math.round((endedAt.getTime() - activeTimer.startedAt.getTime()) / 60000);

  return prisma.timeLog.update({
    where: { id: activeTimer.id },
    data: {
      endedAt,
      durationMinutes,
      note: data.note || activeTimer.note,
    }
  });
}

export async function getActiveTimer(userId: string) {
  return prisma.timeLog.findFirst({
    where: { userId, endedAt: null },
    include: {
      task: {
        include: {
          project: true
        }
      }
    }
  });
}

export async function getTimeLogsByTask(taskId: string) {
  return prisma.timeLog.findMany({
    where: { taskId },
    include: { user: true },
    orderBy: { startedAt: 'desc' }
  });
}
