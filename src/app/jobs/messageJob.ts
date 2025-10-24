import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import Agent from "../integrations/agno/Agent";
import dotenv from "dotenv";
import sendMessage from "../services/MessageService";

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

messageWorker.on("completed", (job: Job) => {
  console.log(`Job ${job.id} has completed!`);
});

messageWorker.on("failed", (job: Job, err) => {
  if (job) {
    console.log(`Job ${job.id} has failed with ${err.message}`);
  } else {
    console.log(`A job has failed with ${err.message}`);
  }
});

export default messageWorker;
