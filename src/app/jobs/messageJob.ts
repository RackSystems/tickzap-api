import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import Agent from "../integrations/agno/Agent";
import dotenv from "dotenv";

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
    await Agent.useAgent(agentId, payload);
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
