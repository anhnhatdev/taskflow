import { prisma } from '../../index.js';
import { CreateSprintInput, UpdateSprintInput } from './sprint.schema.js';

export async function createSprint(projectId: string, data: CreateSprintInput) {
  return prisma.sprint.create({
    data: {
      ...data,
      projectId,
    }
  });
}

export async function findSprintsByProject(projectId: string) {
  return prisma.sprint.findMany({
    where: { projectId },
    include: {
      tasks: {
        select: { id: true, status: true, estimateHours: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateSprint(sprintId: string, data: UpdateSprintInput) {
  return prisma.sprint.update({
    where: { id: sprintId },
    data
  });
}

export async function addTaskToSprint(sprintId: string, taskId: string) {
  return prisma.task.update({
    where: { id: taskId },
    data: { sprintId }
  });
}

export async function getBurndownData(sprintId: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { tasks: true }
  });

  if (!sprint || !sprint.startDate || !sprint.endDate) {
    throw new Error('Sprint must have start and end dates for burndown chart');
  }

  // This is a simplified version. A real burndown would look at history logs.
  // For now, let's just return total hours vs completed hours.
  const totalHours = sprint.tasks.reduce((acc, task) => acc + (task.estimateHours || 0), 0);
  const completedHours = sprint.tasks
    .filter(task => task.status === 'DONE')
    .reduce((acc, task) => acc + (task.estimateHours || 0), 0);

  return {
    totalHours,
    completedHours,
    remainingHours: totalHours - completedHours,
    taskCount: sprint.tasks.length,
    completedCount: sprint.tasks.filter(t => t.status === 'DONE').length,
  };
}
