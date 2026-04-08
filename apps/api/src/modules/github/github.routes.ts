import { FastifyInstance } from 'fastify';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

// Create BullMQ Queue for GitHub webhooks
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const webhookQueue = new Queue('github-webhooks', { connection: redis });

export async function githubRoutes(fastify: FastifyInstance) {
  // Public webhook endpoint
  fastify.post('/webhook', async (request, reply) => {
    const signature = request.headers['x-hub-signature-256'];
    const event = request.headers['x-github-event'];
    const payload = request.body;

    // TODO: Verify signature in production
    
    // Add to queue for background processing
    await webhookQueue.add('process-webhook', {
      event,
      payload,
    });

    return { received: true };
  });

  // Endpoint to connect a project to a GitHub repository
  fastify.post('/connect', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { projectId, repoFullname } = request.body as any;
    
    // Logic to save connection in DB
    // ...
    
    return { success: true };
  });
}
