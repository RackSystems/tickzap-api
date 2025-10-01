import {Message, Ticket, TicketStatus, Prisma} from '@prisma/client';
import message from '..//integrations/evolution/Message';
import {MediaPayload} from '../interfaces/MediaPayload'
import {AudioPayload} from '../interfaces/AudioPayload'
import {TextPayload} from '../interfaces/TextPayload'
import prisma from '../../config/database';
import StorageService from "./StorageService";
import {initiateConversation} from "../../helpers/TicketHelper";

type TicketMessage = {
  contactId: string;
  channelId: string;
  status: TicketStatus;
  userId?: string;
};

type MediaMessage = {
  mediaType: MediaType;
  mediaUrl: string;
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

enum MessageType {
  USER = 'USER',
  CLIENT = 'CLIENT',
  BOT =  'BOT'
}

/**
 * ao receber a mensagem (vem pelo webhook e ele cria o ticket) tem o ticketId, vai salvar no banco,
 * ao enviar a mensagem, vamos criar o ticket aqui e salvar no banco,
 *
 **/
export default {
  async store(data: Prisma.MessageUncheckedCreateInput): Promise<Message> {
    if (data.ticketId) {
      data.status = MessageStatus.RECEIVED;
    }

    if (!data.ticketId) {
      const createdTicket = await initiateConversation(data);

      data.ticketId = createdTicket.id;
      data.status = MessageStatus.SEND;
    }

    if (data.mediaType) {
      //save path - object key on mediaUrl
      const mediaMessage = this.processMidea(data.mediaType, data.mediaUrl);
      data = { ...data, ...mediaMessage };
    }

    return prisma.message.create({data})
  },

  async index(ticketId: string): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: {ticketId},
      orderBy: {
        createdAt: 'asc',
      },
    });

    return Promise.all(
      messages.map(async (message) => {
        if (message.mediaUrl) {
          try {
            message.mediaUrl = await StorageService.getSignedUrl(message.mediaUrl);
          } catch (error) {
            console.error(`Failed to get signed URL for ${message.mediaUrl}:`, error);
          }
        }
        return message;
      })
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
        throw new Error(`Tipo de mídia não suportado: ${mediaType}`);
    }
    return mediaMessage;
  },

  //para usar essa funçao, vai precisar usar a store antes, pois ela valida o payload e cria a mensagem que sera enviada
  async sendMessage(data: Message) {
    let ticket: Ticket;
    let sended: any;

    if (!data.channelId) {
      throw new Error('Esse canal não foi encontrado');
    }

    if (!data.ticketId) {
      ticket = await initiateConversation(data);
    } else {
      ticket = await prisma.ticket.findUnique({
        where: { id: data.ticketId }
      });
    }
    console.log('PAYLOAD E TICKET ', ticket, data);
    if (!ticket) {
      throw new Error('Esse ticket não foi encontrado');
    }

    if (ticket.status === TicketStatus.CLOSED) {
      return;
    }

    const contact =  await prisma.contact.findUnique({
      where: { id: data.contactId }
    });

    const instance = ticket.channelId;

    //tenta enviar, se enviado atualiza dados da mensagem
    try {
      //media message
      if (data.mediaType) {
        let media: MediaPayload;
        media = {
          media: data.mediaUrl,
          type: data.mediaType,
          mediaType: data.mediaType,
          number: contact?.phone,
        };
        sended = await message.sendMedia(instance, media);
      }

      //send text message
      else if (data.content) {
        let text: TextPayload;
        text = {
          text: data.content,
          number: contact?.phone,
        };
        sended = await message.sendText(instance, text);
      }

      //send audio message
      else {
        let audio: AudioPayload;
        //front end grava o audio, envia para o minio, e o minio retorna o url do audio
        audio = {
          audio: data.mediaUrl,
          number: contact?.phone,
        };
        sended = await message.sendAudio(instance, audio);
      }

      const { channelId, ...messageData } = data;

      //salvar mensagem
      await prisma.message.create({
        data: { ...messageData,
          id: sended.key.id,
          ticketId: ticket.id,
          contactId: contact?.id,
          type: MessageType.USER,
          status: MessageStatus.SEND,
          sentAt: new Date(),
        }
      });

    } catch (error) {
      // await prisma.message.create({
      //   data: {
      //     ...messageData,
      //     id: sended.key.id || `${Date.now()}${Math.random()}`,
      //     type: MessageType.USER,
      //     status: MessageStatus.FAILED,
      //   }
      // });
      throw new Error('Falha ao enviar mensagem');
    }
  }
}
