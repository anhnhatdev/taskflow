import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import socketio from 'fastify-socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import pino from 'pino';

// Modules
import { authRoutes } from './modules/auth/auth.routes.js';
import { workspaceRoutes } from './modules/workspace/workspace.routes.js';
import { projectRoutes } from './modules/project/project.routes.js';
import { taskRoutes } from './modules/task/task.routes.js';
import { githubRoutes } from './modules/github/github.routes.js';
import { githubWorker } from './modules/github/github.worker.js';
import { timeRoutes } from './modules/time/time.routes.js';

dotenv.config({ path: '../../.env' });

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const fastify = Fastify({
  logger: logger as any,
});

export const prisma = new PrismaClient();

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
    io: any;
  }
}

async function bootstrap() {
  try {
    // Plugins
    await fastify.register(cors, {
      origin: true,
      credentials: true,
    });

    await fastify.register(cookie);

    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'super-secret',
      cookie: {
        cookieName: 'refreshToken',
        signed: false,
      },
    });

    await fastify.register(socketio, {
      cors: {
        origin: true,
        credentials: true,
      }
    });

    // Decorators
    fastify.decorate('authenticate', async (request: any, reply: any) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    });

    // Routes
    fastify.get('/health', async () => {
      return { status: 'OK' };
    });

    // Root route for API v1
    fastify.register(async (api) => {
      // Register modules
      await api.register(authRoutes, { prefix: '/auth' });
      await api.register(workspaceRoutes, { prefix: '/workspaces' });
      await api.register(projectRoutes, { prefix: '/workspaces/:workspaceId/projects' });
      await api.register(taskRoutes, { prefix: '/projects/:projectId/tasks' });
      await api.register(githubRoutes, { prefix: '/github' });
      await api.register(timeRoutes, { prefix: '/time' });

      api.get('/', async () => {
        return { message: 'Taskflow API v1' };
      });
    }, { prefix: '/api/v1' });

    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    // Start BullMQ Workers
    githubWorker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} completed`);
    });

    fastify.ready((err) => {
      if (err) throw err;
      fastify.io.on('connection', (socket: any) => {
        console.log(`[Socket] Client connected: ${socket.id}`);
        
        socket.on('join-project', (projectId: string) => {
          socket.join(`project:${projectId}`);
          console.log(`[Socket] Client ${socket.id} joined project:${projectId}`);
        });
      });
    });

    console.log(`🚀 Server ready at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
