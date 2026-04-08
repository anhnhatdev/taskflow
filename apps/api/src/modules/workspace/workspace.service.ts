import { prisma } from '../../index.js';
import { CreateWorkspaceInput } from './workspace.schema.js';

export async function createWorkspace(data: CreateWorkspaceInput, userId: string) {
  return prisma.workspace.create({
    data: {
      ...data,
      createdBy: userId,
      members: {
        create: {
          userId,
          role: 'OWNER',
        }
      }
    },
    include: {
      members: true,
    }
  });
}

export async function findWorkspacesByUser(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        }
      }
    }
  });
}

export async function findWorkspaceBySlug(slug: string) {
  return prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            }
          }
        }
      }
    }
  });
}
