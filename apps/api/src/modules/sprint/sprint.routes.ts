import { FastifyInstance } from 'fastify';
import { createSprintSchema, updateSprintSchema, addTaskToSprintSchema } from './sprint.schema.js';
import { createSprint, findSprintsByProject, updateSprint, addTaskToSprint, getBurndownData } from './sprint.service.js';

export async function sprintRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const { projectId } = request.params as any;
    const sprints = await findSprintsByProject(projectId);
    return { success: true, data: sprints };
  });

  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: { body: createSprintSchema }
  }, async (request) => {
    const { projectId } = request.params as any;
    const body = request.body as any;
    const sprint = await createSprint(projectId, body);
    return { success: true, data: sprint };
  });

  fastify.patch('/:sprintId', {
    onRequest: [fastify.authenticate],
    schema: { body: updateSprintSchema }
  }, async (request) => {
    const { sprintId } = request.params as any;
    const body = request.body as any;
    const sprint = await updateSprint(sprintId, body);
    return { success: true, data: sprint };
  });

  fastify.post('/:sprintId/tasks', {
    onRequest: [fastify.authenticate],
    schema: { body: addTaskToSprintSchema }
  }, async (request) => {
    const { sprintId } = request.params as any;
    const { taskId } = request.body as any;
    const task = await addTaskToSprint(sprintId, taskId);
    return { success: true, data: task };
  });

  fastify.get('/:sprintId/burndown', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const { sprintId } = request.params as any;
    const data = await getBurndownData(sprintId);
    return { success: true, data };
  });
}
