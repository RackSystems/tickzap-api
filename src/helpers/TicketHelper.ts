import {Ticket, TicketStatus, Prisma} from '@prisma/client';
import prisma from '../config/database';

export async function initiateConversation(data: any): Promise<Ticket> {
  return await prisma.ticket.create({
    data: {
      contactId: data.contactId,
      channelId: data.channelId,
      status: TicketStatus.PENDING,
      userId: data.userId,
    } satisfies Ticket
  });
}