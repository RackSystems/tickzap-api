import {Message, Ticket, TicketStatus, Prisma} from '@prisma/client';
import prisma from '../../config/database';

type TicketMessage = {
  contactId: String;
  channelId: String;
  status: TicketStatus.PENDING;
  userId?: String;
};

type MediaMessage = {
  mediaType: MediaType;
  mediaUrl: String;
};

enum MessageStatus {
  SEND = 'SEND',
  RECEIVED = 'RECEIVED',
  READ = 'READ',
  FAILED = 'FAILED'
}

enum MediaType {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

/**
 * ao receber a mensagem (vem pelo webhook e ele cria o ticket) tem o ticketId, vai salvar no banco,
 * ao enviar a mensagem, vamos criar o ticket aqui e salvar no banco,
 *
 **/
export default {
  async store(data: Message): Promise<Message> {
    if (data.ticketId) {
      data.status = MessageStatus.RECEIVED;
    }

    if (!data.ticketId) {
      const createdTicket = await prisma.ticket.create({
        data: {
          contactId: data.contactId,
          channelId: data.channelId,
          status: TicketStatus.PENDING,
          userId: data.userId,
        } satisfies TicketMessage
      });

      data.ticketId = createdTicket.id;
      data.status = MessageStatus.SEND;
    }

    if (data.mediaType) {
      //save path - object key on mediaUrl
      this.processMidea(data.mediaType, data.mediaUrl)
    }

    return prisma.message.create({data})
  },

  async index(ticketId: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: {ticketId},
      orderBy: {
        createdAt: 'asc',
      },
    });
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
          mediaUrl,
        };
        break;

      case MediaType.VIDEO:
        mediaMessage = {
          mediaType: MediaType.VIDEO,
          mediaUrl,
        };
        break;

      case MediaType.DOCUMENT:
        mediaMessage = {
          mediaType: MediaType.DOCUMENT,
          mediaUrl,
        };
        break;

      default:
        throw new Error(`Tipo de mídia não suportado: ${mediaType}`);
    }
    return mediaMessage;
  },
}
