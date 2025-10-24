import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import Agent from "../integrations/agno/Agent";
import dotenv from "dotenv";
import sendMessage from "../services/MessageService";
import { sendToClient } from "../../websocket";

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

//todo: o websocket precisa ter uma conexao para notificar o ticket atual, e outra para notificar a ultima mensagem de cada ticket (usado para todos os tickets existentes)

messageWorker.on("completed", (job: Job) => {
  console.log(`Job ${job.id} has completed!`);
  if (job.data.payload.clientId) {
    sendToClient(job.data.payload.clientId, {
      type: "messageProcessed",
      jobId: job.id,
      ticketId: job.data.payload.session_id,
      contactId: job.data.payload.user_id,
    });
  }
});

messageWorker.on("failed", (job: Job, err) => {
  if (job) {
    console.log(`Job ${job.id} has failed with ${err.message}`);
    if (job.data.payload.clientId) {
      sendToClient(job.data.payload.clientId, {
        type: "messageProcessingFailed",
        jobId: job.id,
        ticketId: job.data.payload.session_id,
        contactId: job.data.payload.user_id,
        error: err.message,
      });
    }
  } else {
    console.log(`A job has failed with ${err.message}`);
  }
});

export default messageWorker;
