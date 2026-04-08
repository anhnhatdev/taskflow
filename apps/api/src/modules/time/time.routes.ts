import { FastifyInstance } from 'fastify';
import { startTimeLogSchema, stopTimeLogSchema } from './time.schema.js';
import { startTimeLog, stopTimeLog, getActiveTimer, getTimeLogsByTask } from './time.service.js';

export async function timeRoutes(fastify: FastifyInstance) {
  fastify.get('/active', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const user = request.user as any;
    const timer = await getActiveTimer(user.id);
    return { success: true, data: timer };
  });

  fastify.post('/start', {
    onRequest: [fastify.authenticate],
    schema: { body: startTimeLogSchema }
  }, async (request) => {
    const user = request.user as any;
    const body = request.body as any;
    const timer = await startTimeLog(user.id, body);
    return { success: true, data: timer };
  });

  fastify.post('/stop', {
    onRequest: [fastify.authenticate],
    schema: { body: stopTimeLogSchema }
  }, async (request) => {
    const user = request.user as any;
    const body = request.body as any;
    const timer = await stopTimeLog(user.id, body);
    return { success: true, data: timer };
  });

  fastify.get('/tasks/:taskId', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const { taskId } = request.params as any;
    const logs = await getTimeLogsByTask(taskId);
    return { success: true, data: logs };
  });
}
