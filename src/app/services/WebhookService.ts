import { formatPhoneNumber } from "../../helpers/functions";
import ContactService from "../services/ContactService";
import TicketService from "./TicketService";
import ChannelService from "./ChannelService";
import MessageService from "../services/MessageService";
import { MediaType, MessageType, TicketStatus } from ".prisma/client";
import Message from "../integrations/evolution/Message";
import StorageService from "./StorageService";

const messageTypeToMediaTypeMap: Record<string, MediaType> = {
  imageMessage: "IMAGE",
  videoMessage: "VIDEO",
  audioMessage: "AUDIO",
  documentMessage: "DOCUMENT",
  stickerMessage: "IMAGE",
};

const useAgent = true;

export default {
  async handleMessagesUpsert(payload: any): Promise<void> {
    try {
      const { key, pushName, message, messageType, instanceId, messageTimestamp } = payload.data;

      if (key.fromMe) {
        return;
      }

      const channel = await ChannelService.show({ identifier: instanceId });
      if (!channel) {
        console.error(`Channel not found for instanceId: ${instanceId}`);
        return;
      }

      let contact = await ContactService.show({ remoteJid: key.remoteJid, channelId: channel.id });
      contact ??= await ContactService.store({
        name: pushName,
        phone: key.remoteJid,
        status: true,
        remoteJid: key.remoteJid,
        channelId: channel.id,
      });

      let ticket = await TicketService.show({ contactId: contact.id, channelId: channel.id });
      ticket ??= await TicketService.store({
        contactId: contact.id,
        channelId: channel.id,
        status: TicketStatus.PENDING,
      });

      const validMediaTypes = ["imageMessage", "videoMessage", "audioMessage", "documentMessage", "stickerMessage"];

      let content = "";
      let mediaUrl: string | null = null;
      let mediaType: MediaType | null = null;

      if (validMediaTypes.includes(messageType)) {
        const payloadForApi = {
          message: {
            key: {
              id: payload.data.key.id,
            },
          },
          convertToMp4: false,
        };

        // type MediaResponse = { base64: string; fileName: string; mimetype: string; };
        const response = await Message.convertMedia(payload.instance, payloadForApi);

        const base64Data = response.base64;

        if (typeof base64Data !== "string") {
          throw new Error("Não foi possível obter os dados em base64 da resposta da mídia.");
        }

        const fileBuffer = Buffer.from(base64Data, "base64");

        // @ts-ignore
        const fileName = response.fileName;
        // @ts-ignore
        const mime = response.mimetype;

        const fileKey = `tickets/${ticket.id}/${fileName}`;

        mediaUrl = await StorageService.upload({
          buffer: fileBuffer,
          key: fileKey,
          mimeType: mime,
        });

        content =
          message.imageMessage?.caption || message.videoMessage?.caption || message.documentMessage?.caption || "";
        mediaType = messageTypeToMediaTypeMap[messageType] ?? null;
      } else {
        content = message.conversation || (message.extendedTextMessage && message.extendedTextMessage.text) || "";
      }

      await MessageService.store({
        id: key.id,
        ticketId: ticket.id,
        contactId: contact.id,
        content: content,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        type: MessageType.CLIENT,
        sentAt: new Date(messageTimestamp * 1000),
      });

      console.log(`Message created successfully: ${key.id}`);

      if (useAgent) {
        //todo add message to queue

      }
    } catch (error) {
      console.error("Error in handleMessagesUpsert:", error);
      throw error;
    }
  },

  // Placeholder methods for future implementation
  async handleQrCodeUpdated(payload: any): Promise<void> {
    // Implementation for QR code updates
    console.log("QR Code updated event received but not yet implemented");
  },

  async handleConnectionUpdate(payload: any): Promise<void> {
    // Implementation for connection status updates
    console.log("Connection update event received but not yet implemented");
  },

  async handleContactsUpdate(payload: any): Promise<void> {
    // Implementation for contact updates
    console.log("Contacts update event received but not yet implemented");
  },

  async handleContactsUpsert(payload: any): Promise<void> {
    const { data: contactsData } = payload;

    const contacts = Array.isArray(contactsData) ? contactsData : [contactsData];

    if (contacts.length === 0) {
      return;
    }

    const instanceId = contacts[0].instanceId;
    const channel = await ChannelService.show({ id: instanceId });

    if (!channel) {
      return;
    }

    for (const contactData of contacts) {
      if (!contactData.remoteJid) {
        continue;
      }

      const contact = await ContactService.show({ remoteJid: contactData.remoteJid });

      if (contact) {
        await ContactService.update(contact.id, {
          avatar: contactData.profilePicUrl || contact.avatar,
          name: contactData.pushName || contact.name,
        });
      } else {
        await ContactService.store({
          remoteJid: contactData.remoteJid,
          avatar: contactData.profilePicUrl,
          name: contactData.pushName || "",
          phone: formatPhoneNumber(contactData.remoteJid),
          channelId: channel.id,
        });
      }
    }
  }
};
