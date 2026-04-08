import { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema } from './auth.schema.js';
import { createUser, findUserByEmail, verifyPassword } from './auth.service.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', {
    schema: {
      body: registerSchema
    }
  }, async (request, reply) => {
    const body = request.body as any;
    
    const exists = await findUserByEmail(body.email);
    if (exists) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'Email already registered',
        }
      });
    }

    const user = await createUser(body);
    
    return {
      success: true,
      data: user,
    };
  });

  fastify.post('/login', {
    schema: {
      body: loginSchema
    }
  }, async (request, reply) => {
    const body = request.body as any;
    
    const user = await findUserByEmail(body.email);
    if (!user || !user.passwordHash) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }
      });
    }

    const isValid = await verifyPassword(body.password, user.passwordHash);
    if (!isValid) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }
      });
    }

    const token = fastify.jwt.sign({ 
      id: user.id, 
      email: user.email,
      name: user.name 
    });

    // In a real app, we'd also handle refresh tokens here as per PRD
    // For now, let's return the access token

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken: token,
      },
    };
  });

  fastify.get('/me', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    return {
      success: true,
      data: request.user,
    };
  });
}
