import { FastifyInstance } from 'fastify';
import { createWorkspaceSchema } from './workspace.schema.js';
import { createWorkspace, findWorkspacesByUser, findWorkspaceBySlug } from './workspace.service.js';

export async function workspaceRoutes(fastify: FastifyInstance) {
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createWorkspaceSchema
    }
  }, async (request, reply) => {
    const user = request.user as any;
    const body = request.body as any;

    try {
      const workspace = await createWorkspace(body, user.id);
      return {
        success: true,
        data: workspace,
      };
    } catch (err: any) {
      if (err.code === 'P2002') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'SLUG_EXISTS',
            message: 'Workspace slug already taken',
          }
        });
      }
      throw err;
    }
  });

  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const user = request.user as any;
    const workspaces = await findWorkspacesByUser(user.id);
    return {
      success: true,
      data: workspaces,
    };
  });

  fastify.get('/:slug', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { slug } = request.params as any;
    const workspace = await findWorkspaceBySlug(slug);

    if (!workspace) {
      return reply.code(404).send({
        success: false,
        error: {
          code: 'WORKSPACE_NOT_FOUND',
          message: 'Workspace not found',
        }
      });
    }

    return {
      success: true,
      data: workspace,
    };
  });
}
