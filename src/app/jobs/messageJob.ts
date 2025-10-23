
// @ts-ignore
import { Worker, Job } from 'bullmq';
// @ts-ignore
import IORedis from 'ioredis';
import Agent from '../integrations/agno/Agent';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const messageWorker = new Worker(
  'MessageQueue',
  async (job: Job) => {
    const { agentId, payload } = job.data;
    console.log(`Processing message for agent ${agentId}`, payload);
    try {
      await Agent.useAgent(agentId, payload);
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  },
  { connection }
);

messageWorker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

messageWorker.on('failed', (job, err) => {
  if (job) {
    console.log(`Job ${job.id} has failed with ${err.message}`);
  } else {
    console.log(`A job has failed with ${err.message}`);
  }
});

export default messageWorker;
