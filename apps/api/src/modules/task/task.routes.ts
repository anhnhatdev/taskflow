import { FastifyInstance } from 'fastify';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from './task.schema.js';
import { createTask, findTasksByProject, updateTask, moveTask, findTaskById } from './task.service.js';

export async function taskRoutes(fastify: FastifyInstance) {
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createTaskSchema,
      params: {
        projectId: { type: 'string' }
      }
    }
  }, async (request, reply) => {
    const user = request.user as any;
    const { projectId } = request.params as any;
    const body = request.body as any;

    const task = await createTask(projectId, body, user.id);
    fastify.io.to(`project:${projectId}`).emit('task:created', task);

    return {
      success: true,
      data: task,
    };
  });

  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        projectId: { type: 'string' }
      }
    }
  }, async (request) => {
    const { projectId } = request.params as any;
    const tasks = await findTasksByProject(projectId);
    return {
      success: true,
      data: tasks,
    };
  });

  fastify.get('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params as any;
    const task = await findTaskById(id);

    if (!task) {
      return reply.code(404).send({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
        }
      });
    }

    return {
      success: true,
      data: task,
    };
  });

  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      body: updateTaskSchema
    }
  }, async (request) => {
    const { id } = request.params as any;
    const body = request.body as any;

    const task = await updateTask(id, body);
    return {
      success: true,
      data: task,
    };
  });

  fastify.post('/:id/move', {
    onRequest: [fastify.authenticate],
    schema: {
      body: moveTaskSchema
    }
  }, async (request) => {
    const { id } = request.params as any;
    const body = request.body as any;

    const task = await moveTask(id, body);
    fastify.io.to(`project:${task.projectId}`).emit('task:moved', task);

    return {
      success: true,
      data: task,
    };
  });
}
