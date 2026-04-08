import { prisma } from '../../index.js';
import { CreateProjectInput } from './project.schema.js';

export async function createProject(workspaceId: string, data: CreateProjectInput, userId: string) {
  return prisma.project.create({
    data: {
      ...data,
      workspaceId,
      createdBy: userId,
    }
  });
}

export async function findProjectsByWorkspace(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
  });
}
