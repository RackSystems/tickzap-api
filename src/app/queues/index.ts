import { Queue } from 'bullmq';
import { redisConnection } from '../../config/redis';

export const AGENT_PROCESSING_QUEUE = 'agent-processing';
export const AGENT_RESPONSE_QUEUE = 'agent-response';

export const agentProcessingQueue = new Queue(AGENT_PROCESSING_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const agentResponseQueue = new Queue(AGENT_RESPONSE_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});
//todo conferir