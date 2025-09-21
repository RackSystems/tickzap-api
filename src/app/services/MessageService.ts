import {Message, Ticket, TicketStatus, Prisma} from '@prisma/client';
import prisma from '../../config/database';

type MessageQuery = {
  ticketId?: string;
  userId?: string;
  contactId?: string;
  content?: string;
  type?: string;
  status?: string;
};

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
      //todo save url
      this.processMidea(data.mediaType, data.mediaUrl)
    }

    return prisma.message.create({data})
  },

  async index(query: MessageQuery): Promise<Message[]> {
    const where: Prisma.MessageWhereInput = {};

    if (query.ticketId) {
      where.ticketId = {contains: query.ticketId, mode: 'insensitive'};
    }
    if (query.userId) {
      where.userId = {contains: query.userId, mode: 'insensitive'};
    }
    if (query.contactId) {
      where.contactId = {contains: query.contactId, mode: 'insensitive'};
    }
    if (query.content) {
      where.content = {contains: query.content, mode: 'insensitive'};
    }
    if (query.type) {
      where.type = {contains: query.type, mode: 'insensitive'};
    }
    if (query.status) {
      where.status = {contains: query.status, mode: 'insensitive'};
    }
    return prisma.message.findMany({where});
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
          mediaUrl: '' //todo base 64 image
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

    }
    return mediaMessage;
  },
}
