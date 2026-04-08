import { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { prisma } from '../../index.js';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from './task.schema.js';
import { createTask, findTasksByProject, updateTask, moveTask, findTaskById } from './task.service.js';
import { suggestTaskCategorization } from '../ai/ai.service.js';

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

  fastify.post('/:id/ai-suggest', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params as any;
    const task = await findTaskById(id);
    
    if (!task) return reply.code(404).send({ success: false, message: 'Task not found' });

    const suggestions = await suggestTaskCategorization(task.title, task.description || '');
    
    return {
      success: true,
      data: suggestions
    };
  });

  fastify.post('/:id/attachments', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id: taskId } = request.params as any;
    const user = request.user as any;
    
    const data = await request.file();
    if (!data) return reply.code(400).send({ message: 'No file uploaded' });

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const filename = `${Date.now()}-${data.filename}`;
    const filePath = path.join(uploadDir, filename);

    await pipeline(data.file, fs.createWriteStream(filePath));

    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        userId: user.id,
        filename: data.filename,
        fileUrl: `/uploads/${filename}`,
        fileSize: 0, // In real app, get from fs.stat
        mimeType: data.mimetype
      }
    });

    return { 
      success: true, 
      data: attachment 
    };
  });
}
