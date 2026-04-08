import { prisma } from '../../index.js';
import { NotificationType } from '@prisma/client';

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
}) {
  return prisma.notification.create({
    data,
    include: {
      actor: true
    }
  });
}

export async function findUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}

export async function markAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { 
      isRead: true,
      readAt: new Date()
    }
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { 
      isRead: true,
      readAt: new Date()
    }
  });
}
