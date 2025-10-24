import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import Agent from "../integrations/agno/Agent";
import dotenv from "dotenv";
import sendMessage from "../services/MessageService";
import {broadcastToChannel, broadcastToWatchingTicket} from "../../websocket";
import {truncateWithoutCuttingWord} from '../../helpers/TicketHelper'

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const messageWorker = new Worker(
  "MessageQueue",
  async (job: Job) => {
    const { agentId, payload } = job.data;
    console.log(`Processing message for agent ${agentId}`, payload);
    const response = await Agent.useAgent(agentId, payload);

    job.data.response = response;

    if (response.message) {
      /*
       * ticketId: payload.session_id,
       * contactId: payload.contact_id,
       * content: response.message,
       * type: "BOT",
       * */

      await sendMessage.sendMessage({
        ticketId: payload.session_id,
        contactId: payload.user_id,
        content: response.message,
        type: "BOT",
      }); //send message processed by AI
    }
  },
  { connection },
);

messageWorker.on("completed", async (job: Job) => {
  console.log(`Job ${job.id} has completed!`);

  const { session_id, user_id, channelId } = job.data.payload;
  const response = job.data.response;

  await broadcastToWatchingTicket(job.data.payload.session_id, {
    type: "messageProcessed",
    jobId: job.id,
    ticketId: session_id,
    contactId: user_id,
    message: response?.message,
    timestamp: new Date().toISOString(),
  })

  //global notification
  if (channelId) {
    await broadcastToChannel(channelId, {
      type: "ticketUpdated",
      jobId: job.id,
      ticketId: session_id,
      lastMessage: truncateWithoutCuttingWord(response?.message),
      updatedAt: new Date().toISOString(),
      hasNewMessage: true
    })
  } else {
    console.warn(`No channelId for job ${job.id}, skipping global broadcast`);
  }
});

// @ts-ignore
messageWorker.on("failed", async (job: Job, err: Error) => {
  if (job) {
    console.log(`Job ${job.id} has failed with ${err.message}`);
    await broadcastToWatchingTicket(job.data.payload.session_id, {
      type: "messageProcessingFailed",
      jobId: job.id,
      ticketId: job.data.payload.session_id,
      contactId: job.data.payload.user_id,
      error: err.message,
    });
  } else {
    console.log(`A job has failed with ${err.message}`);
  }
});

export default messageWorker;
