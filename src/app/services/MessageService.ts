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

enum MessageStatus {
  SEND = 'SEND',
  RECEIVED = 'RECEIVED',
  READ = 'READ',
  FAILED = 'FAILED'
}

type TicketMessage = {
  contactId: String;
  channelId: String;
  status: TicketStatus.PENDING;
  userId?: String;
};

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

}
