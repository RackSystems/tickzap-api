import {Ticket, Prisma, TicketStatus} from '@prisma/client';
import prisma from '../../config/database';

type TicketQuery = {
  contactId?: string;
  channelId?: string;
  status?: string;
  UserId?: string;
  page?: string;
  pageSize?: string;
};

export default {
  async store(data: Prisma.TicketUncheckedCreateInput): Promise<Ticket> {
    if (!data.status) {
      data.status = TicketStatus.PENDING;
    }

    return prisma.ticket.create({data})
  },

  async destroy(id: string): Promise<Ticket> {
    return prisma.ticket.delete({
      where: {id}
    })
  },

  //todo fix tipagem
  async index(query: TicketQuery): Promise<any[]> {
    const where: Prisma.TicketWhereInput = {};

    if (query.contactId) {
      where.contactId = query.contactId;
    }
    if (query.channelId) {
      where.channelId = query.channelId;
    }
    if (query.status) {
      where.status = query.status as TicketStatus;
    }
    if (query.UserId) {
      where.UserId = query.UserId;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        contact: true,
        channel: true,
        user: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, mediaType: true }
        }
      }
    });

    return (tickets).map((ticket) => {
      const {messages, ...rest} = ticket || {};
      return {...rest, lastMessage: messages[0] || null};
    });
  },

  async show(filter: Prisma.TicketWhereInput): Promise<Ticket | null> {
    return prisma.ticket.findFirst({
      where: filter,
      include: {
        contact: true,
        channel: true,
        user: true
      }
    });
  },

  async update(id: string, data: Prisma.TicketUncheckedUpdateInput): Promise<Ticket> {
    return prisma.ticket.update({
      where: {id},
      data,
      include: {
        contact: true,
        channel: true,
        user: true
      }
    })
  },
}
