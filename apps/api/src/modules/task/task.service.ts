import { prisma } from '../../index.js';
import { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from './task.schema.js';

export async function createTask(projectId: string, data: CreateTaskInput, userId: string) {
  // Get the next sequence number for the project
  const lastTask = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { sequenceNumber: 'desc' },
  });

  const sequenceNumber = (lastTask?.sequenceNumber || 0) + 1;

  // Get the last sort order in the status column
  const lastInStatus = await prisma.task.findFirst({
    where: { projectId, status: data.status || 'BACKLOG' },
    orderBy: { sortOrder: 'desc' },
  });

  const sortOrder = (lastInStatus?.sortOrder || 0) + 1000;

  return prisma.task.create({
    data: {
      ...data,
      projectId,
      sequenceNumber,
      sortOrder,
      createdBy: userId,
    }
  });
}

export async function findTasksByProject(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: { sortOrder: 'asc' },
    include: {
      assignees: {
        include: {
          user: true,
        }
      },
      labels: {
        include: {
          label: true,
        }
      }
    }
  });
}

export async function updateTask(id: string, data: UpdateTaskInput) {
  return prisma.task.update({
    where: { id },
    data,
  });
}

export async function moveTask(id: string, data: MoveTaskInput) {
  return prisma.task.update({
    where: { id },
    data: {
      status: data.status,
      sortOrder: data.sortOrder,
    }
  });
}

export async function findTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      assignees: {
        include: {
          user: true,
        }
      },
      comments: {
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      }
    }
  });
}
