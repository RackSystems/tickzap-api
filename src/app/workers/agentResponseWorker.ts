import { Worker } from 'bullmq';
import { AGENT_RESPONSE_QUEUE } from '../queues';
import { redisConnection } from '../../config/redis';
import prisma from '../../config/database';
import TicketService from '../services/TicketService';
import ContactService from '../services/ContactService';
import ChannelService from '../services/ChannelService';
import message from '../integrations/evolution/Message';
import { MessageType, MessageStatus } from '../enums/MessageEnum';
import HttpException from '../exceptions/HttpException';
//todo conferir
interface AgentResponseJobData {
    response: any; // A resposta completa do Agent.useAgent
    sessionId: string;
    ticketId: number;
}

export const agentResponseWorker = new Worker<AgentResponseJobData>(
    AGENT_RESPONSE_QUEUE,
    async (job) => {
        const { response, ticketId } = job.data;

        // NOTA: A estrutura da resposta do agente pode variar.
        // Ajuste o caminho para obter o texto da mensagem conforme necessário.
        const agentMessageText = response?.message || 'Não foi possível processar sua resposta.';

        console.log(`[RespWorker] Sending agent response for ticket ${ticketId}`);

        const ticket = await TicketService.show({ id: ticketId });
        if (!ticket) {
            throw new Error(`[RespWorker] Ticket ${ticketId} not found.`);
        }

        if (ticket.status === 'CLOSED') {
            console.log(`[RespWorker] Ticket ${ticketId} is closed. Aborting message send.`);
            return;
        }

        const contact = await ContactService.show({ id: ticket.contactId });
        if (!contact || !contact.phone) {
            throw new Error(`[RespWorker] Contact or phone not found for ticket ${ticketId}.`);
        }

        const channel = await ChannelService.show({ id: ticket.channelId });
        if (!channel) {
            throw new Error(`[RespWorker] Channel not found for ticket ${ticketId}.`);
        }

        try {
            // 1. Envia a mensagem pela API (Evolution)
            const evolutionResponse = await message.sendText(channel.name, {
                text: agentMessageText,
                number: contact.phone,
            });

            if (!evolutionResponse?.key?.id) {
                throw new HttpException('[RespWorker] Resposta inesperada da API Evolution', 500);
            }

            // 2. Salva a mensagem do bot no banco de dados
            await prisma.message.create({
                data: {
                    id: evolutionResponse.key.id,
                    ticketId: ticket.id,
                    contactId: contact.id,
                    channelId: channel.id,
                    content: agentMessageText,
                    type: MessageType.BOT,
                    status: MessageStatus.SEND,
                    sentAt: new Date(),
                }
            });

            console.log(`[RespWorker] Successfully sent and stored agent message for ticket ${ticketId}`);

        } catch (error: any) {
            console.error(`[RespWorker] Failed to send agent message for ticket ${ticketId}:`, error.message);
            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 10 // Pode processar mais respostas concorrentemente
    }
);

agentResponseWorker.on('completed', (job) => {
    console.log(`[AgentResponseWorker] Job ${job.id} has completed.`);
});

agentResponseWorker.on('failed', (job, err) => {
    console.error(`[AgentResponseWorker] Job ${job.id} has failed with ${err.message}`);
});
