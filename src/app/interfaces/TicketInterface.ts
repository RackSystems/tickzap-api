import { TicketStatus } from '@prisma/client';

export interface Ticket {
  id: string;
  contactId: string;
  channelId: string;
  status: TicketStatus;
  UserId?: string;
  useAI: boolean;
  createdAt: Date;
  updatedAt: Date;
}