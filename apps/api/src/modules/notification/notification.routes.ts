import { FastifyInstance } from 'fastify';
import { findUserNotifications, markAsRead, markAllAsRead } from './notification.service.js';

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const user = request.user as any;
    const notifications = await findUserNotifications(user.id);
    return { success: true, data: notifications };
  });

  fastify.patch('/:id/read', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const { id } = request.params as any;
    const notification = await markAsRead(id);
    return { success: true, data: notification };
  });

  fastify.patch('/read-all', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const user = request.user as any;
    await markAllAsRead(user.id);
    return { success: true };
  });
}
