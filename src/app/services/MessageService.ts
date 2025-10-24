import { Message, Prisma, TicketStatus } from "@prisma/client";
import message from "..//integrations/evolution/Message";
import prisma from "../../config/database";
import StorageService from "./StorageService";
import HttpException from "../exceptions/HttpException";
import ContactService from "./ContactService";
import TicketService from "./TicketService";
import ChannelService from "./ChannelService";
import { messageQueue } from "../queues/messageQueue";
import AgentService from "./AgentService";

type MediaMessage = {
  mediaType: MediaType;
  mediaUrl: string;
};

enum MessageStatus {
  SEND = "SEND",
  RECEIVED = "RECEIVED",
  READ = "READ",
  FAILED = "FAILED",
}

enum MediaType {
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
}

enum MessageType {
  USER = "USER",
  CLIENT = "CLIENT",
  BOT = "BOT",
}

/**
 * ao receber a mensagem (vem pelo webhook e ele cria o ticket) tem o ticketId, vai salvar no banco,
 * ao enviar a mensagem, vamos criar o ticket aqui e salvar no banco,
 *
 **/
export default {
  async store(data: Prisma.MessageUncheckedCreateInput): Promise<Message> {
    if (data.ticketId && !data.status) {
      data.status = MessageStatus.RECEIVED;
    }

    if (!data.ticketId) {
      const createdTicket = await prisma.ticket.create({
        data: {
          contactId: data.contactId,
          channelId: data.channelId,
          status: TicketStatus.PENDING,
          UserId: data.userId,
        },
      });

      data.ticketId = createdTicket.id;
      data.status = MessageStatus.SEND;
    }

    if (data.mediaType) {
      //save path - object key on mediaUrl
      const mediaMessage = this.processMidea(data.mediaType, data.mediaUrl);
      data = { ...data, ...mediaMessage };
    }

    return prisma.message.create({ data });
  },

  async index(ticketId: string): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { ticketId },
      orderBy: {
        createdAt: "asc",
      },
    });

    return Promise.all(
      messages.map(async (message: any) => {
        if (message.mediaUrl) {
          try {
            message.mediaUrl = await StorageService.getSignedUrl(message.mediaUrl);
          } catch (error) {
            console.error(`Failed to get signed URL for ${message.mediaUrl}:`, error);
          }
        }
        return message;
      }),
    );
  },

  async show(filter: Prisma.MessageWhereUniqueInput): Promise<Message | null> {
    return prisma.message.findUnique({
      where: filter,
    });
  },

  processMidea: function (mediaType: string, mediaUrl: string): MediaMessage {
    let mediaMessage: MediaMessage;
    switch (mediaType) {
      case MediaType.IMAGE:
        mediaMessage = {
          mediaType: MediaType.IMAGE,
          mediaUrl: mediaUrl,
        };
        break;
      case MediaType.AUDIO:
        mediaMessage = {
          mediaType: MediaType.AUDIO,
          mediaUrl: mediaUrl,
        };
        break;

      case MediaType.VIDEO:
        mediaMessage = {
          mediaType: MediaType.VIDEO,
          mediaUrl: mediaUrl,
        };
        break;

      case MediaType.DOCUMENT:
        mediaMessage = {
          mediaType: MediaType.DOCUMENT,
          mediaUrl: mediaUrl,
        };
        break;

      default:
        throw new HttpException(`Tipo de mídia não suportado: ${mediaType}`, 415);
    }
    return mediaMessage;
  },

  //todo tipagem
  async sendMessage(data: any): Promise<any> {
    const contact = await ContactService.show({ id: data.contactId });

    if (!contact || !contact?.channelId || !contact?.phone) {
      throw new HttpException("Algo não foi encontrado", 404);
    }

    const channel = await ChannelService.show({ id: contact.channelId });

    if (!channel) {
      throw new HttpException("Canal não foi encontrado", 404);
    }

    //criar ticket ao enviar a primeira mensagem - iniciar conversa
    let ticket;
    if (!data.ticketId) {
      ticket = await prisma.ticket.create({
        data: {
          contactId: data.contactId,
          channelId: channel.id,
          status: TicketStatus.PENDING,
          UserId: data.userId,
        },
      });
    } else {
      ticket = await TicketService.show({ id: data.ticketId });
    }

    if (!ticket) {
      throw new HttpException("Esse ticket não foi encontrado", 404);
    }

    if (ticket.status === TicketStatus.CLOSED) {
      throw new HttpException("Ticket fechado", 400);
    }

    try {
      const messageToStore: Prisma.MessageUncheckedCreateInput = {
        id: "",
        ticketId: ticket.id,
        contactId: contact.id,
        content: data.content,
        type: MessageType.USER,
        status: MessageStatus.SEND,
        sentAt: new Date(), // pegar do response
      };

      let response;
      // media message
      if (data.mediaType) {
        response = await message.sendMedia(channel.name, {
          media: data.mediaUrl,
          type: data.mediaType,
          mediaType: data.mediaType,
          number: contact.phone,
        });

        messageToStore.mediaUrl = data.mediaUrl;
        messageToStore.mediaType = data.mediaType;
      }

      // text message
      else if (data.content) {
        response = await message.sendText(channel.name, {
          text: data.content,
          number: contact.phone,
        });
      }

      // audio message
      // front end grava o audio, envia para o minio, e o minio retorna o url do audio
      else {
        response = await message.sendAudio(channel.name, {
          audio: data.mediaUrl,
          number: contact.phone,
        });

        messageToStore.mediaUrl = data.mediaUrl;
        messageToStore.mediaType = MediaType.AUDIO;
      }

      if (!response?.key?.id) {
        throw new HttpException("Resposta inesperada da API Evolution", 500);
      }

      // @ts-ignore
      messageToStore.id = response.key.id;

      await this.store(messageToStore);
      if (ticket.useAI && data.content) {
        const payload = {
          message: data.content,
          session_id: `ticket_${ticket.id}`,
          user_id: `user_${ticket.UserId}`,
        };

        const agent = await AgentService.index();
        const agentId = agent[0].id;

        await messageQueue.add(
          "process-message",
          { agentId, payload },
          {
            backoff: 5000,
            removeOnComplete: true,
          },
        );

        await this.addMessageToQueue(agent[0].id, payload);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException("Falha ao enviar mensagem", 500);
    }
  },

  async addMessageToQueue(agentId: string, payload: any) {
    try {
      if (!agentId || !payload) {
        console.error("Missing agentId or payload");
        new HttpException("Missing agentId or payload", 404);
      }

      await messageQueue.add(
        "process-message",
        { agentId, payload },
        {
          backoff: 5000,
          removeOnComplete: true,
        },
      );
      console.log(`📩 Mensagem enfileirada para agent ${agentId}`);
    } catch (error) {
      console.error("❌ Erro ao adicionar job:", error);
      new HttpException(`Erro ao adicionar job: ${error}`, 500);
    }
  },
};
