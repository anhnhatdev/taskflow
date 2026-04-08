import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import pino from 'pino';

// Modules
import { authRoutes } from './modules/auth/auth.routes.js';
import { workspaceRoutes } from './modules/workspace/workspace.routes.js';

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
  logger,
});

export const prisma = new PrismaClient();

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
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

      api.get('/', async () => {
        return { message: 'Taskflow API v1' };
      });
    }, { prefix: '/api/v1' });

    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    console.log(`🚀 Server ready at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
