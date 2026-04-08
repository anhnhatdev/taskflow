import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { prisma } from '../../index.js';
import { Octokit } from 'octokit';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const githubWorker = new Worker('github-webhooks', async job => {
  const { event, payload } = job.data;
  console.log(`[GitHub Worker] Processing event: ${event}`);

  try {
    if (event === 'issues') {
      await handleIssueEvent(payload);
    } else if (event === 'push') {
      await handlePushEvent(payload);
    }
    // Add more event handlers as needed
  } catch (err) {
    console.error(`[GitHub Worker] Failed to process ${event}`, err);
    throw err;
  }
}, { connection: redis });

async function handleIssueEvent(payload: any) {
  const { action, issue, repository } = payload;
  
  if (action === 'opened') {
    // Find project linked to this repo
    const project = await prisma.project.findFirst({
      where: { 
        githubRepoName: repository.name,
        githubRepoOwner: repository.owner.login
      }
    });

    if (project) {
      // Get next sequence number
      const lastTask = await prisma.task.findFirst({
        where: { projectId: project.id },
        orderBy: { sequenceNumber: 'desc' },
      });
      const sequenceNumber = (lastTask?.sequenceNumber || 0) + 1;

      // Create a task in Taskflow
      await prisma.task.create({
        data: {
          title: issue.title,
          description: issue.body || '',
          status: 'BACKLOG',
          projectId: project.id,
          sequenceNumber,
          githubIssueId: issue.id.toString(),
          githubIssueNumber: issue.number,
          createdBy: project.createdBy,
        }
      });
      console.log(`[GitHub Worker] Synced new issue: ${issue.title} (TF-${sequenceNumber})`);
    }
  }
}

async function handlePushEvent(payload: any) {
  const { commits, repository } = payload;
  
  // Logic to parse commit messages for keywords like "fixes #123" or "Taskflow: TF-1 done"
  // ...
  console.log(`[GitHub Worker] Processed push to ${repository.full_name}`);
}
