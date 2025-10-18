import { Worker } from 'bullmq';
import { AGENT_PROCESSING_QUEUE, agentResponseQueue } from '../queues';
import { redisConnection } from '../../config/redis';
import Agent from '../integrations/agno/Agent';

interface AgentProcessingJobData {
    message: string;
    sessionId: string;
    ticketId: number;
}

export const agentProcessingWorker = new Worker<AgentProcessingJobData>(
  AGENT_PROCESSING_QUEUE,
  async (job) => {
    const { message, sessionId, ticketId } = job.data;
    console.log(`[Worker] Processing message for session ${sessionId} (Ticket: ${ticketId})`);

    try {
      const response = await Agent.useAgent(message, sessionId);

      await agentResponseQueue.add('process-agent-response', {
        response,
        sessionId,
        ticketId,
      });

      console.log(`[Worker] Agent response enqueued for session ${sessionId} (Ticket: ${ticketId})`);
      return response;
    } catch (error: any) {
      console.error(`[Worker] Error processing agent job for ticket ${ticketId}:`, error.message);
      throw error;
    }
  },
  {
      connection: redisConnection,
      concurrency: 5 // Process up to 5 jobs concurrently
  }
);

agentProcessingWorker.on('completed', (job) => {
    console.log(`[AgentProcessingWorker] Job ${job.id} has completed.`);
});

agentProcessingWorker.on('failed', (job, err) => {
    console.error(`[AgentProcessingWorker] Job ${job.id} has failed with ${err.message}`);
});
