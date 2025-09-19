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

  async index(query: TicketQuery): Promise<Ticket[]> {
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

    return prisma.ticket.findMany({
      where,
      include: {
        contact: true,
        channel: true,
        user: true
      }
    });
  },

  async show(filter: Prisma.TicketWhereUniqueInput): Promise<Ticket | null> {
    return prisma.ticket.findUnique({
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
