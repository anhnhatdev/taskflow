import { FastifyInstance } from 'fastify';
import { createProjectSchema } from './project.schema.js';
import { createProject, findProjectsByWorkspace, findProjectById } from './project.service.js';

export async function projectRoutes(fastify: FastifyInstance) {
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createProjectSchema,
      params: {
        workspaceId: { type: 'string' }
      }
    }
  }, async (request, reply) => {
    const user = request.user as any;
    const { workspaceId } = request.params as any;
    const body = request.body as any;

    const project = await createProject(workspaceId, body, user.id);
    return {
      success: true,
      data: project,
    };
  });

  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        workspaceId: { type: 'string' }
      }
    }
  }, async (request) => {
    const { workspaceId } = request.params as any;
    const projects = await findProjectsByWorkspace(workspaceId);
    return {
      success: true,
      data: projects,
    };
  });

  fastify.get('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params as any;
    const project = await findProjectById(id);

    if (!project) {
      return reply.code(404).send({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        }
      });
    }

    return {
      success: true,
      data: project,
    };
  });
}
