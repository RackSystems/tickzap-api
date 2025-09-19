import {Message, Prisma} from '@prisma/client';
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
  FAILED = 'EFAILED'
}

export default {
  async store(data: Message): Promise<Message> {
    data.status = data.status ?? MessageStatus.RECEIVED;

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
