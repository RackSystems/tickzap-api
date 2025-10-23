
// @ts-ignore
import { Queue } from 'bullmq';
// @ts-ignore
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const messageQueue = new Queue('MessageQueue', { connection });
