import ChannelRepository from "../repositories/ChannelRepository";
import ContactService from "../services/ContactService";
import TicketRepository from "../repositories/TicketRepository";
import MessageRepository from "../repositories/MessageRepository";
import {MessageType, TicketStatus} from ".prisma/client";

export default {
  async handleMessagesUpsert(payload: any): Promise<void> {
    try {
      const {instance, data, sender} = payload;
      const {key, message, pushName} = data;

      if (key.fromMe) {
        return;
      }

      const channel = await ChannelRepository.getById(instance);
      if (!channel) {
        return;
      }

      let contact = await ContactService.show({remoteJid: key.remoteJid, channelId: channel.id});
      contact ??= await ContactService.store({
        name: pushName,
        phone: key.remoteJid,
        status: true,
        remoteJid: key.remoteJid,
        channelId: channel.id
      });

      let ticket;
      ticket = await TicketRepository.findOpenByContactAndChannel(contact.id, channel.id);
      if (!ticket) {
        ticket = await TicketRepository.create({
          contactId: contact.id,
          channelId: channel.id,
          status: TicketStatus.PENDING,
        });
      }

      // Create message
      try {
        // Extract message content from different possible message types
        const content = message.conversation ||
          (message.extendedTextMessage && message.extendedTextMessage.text) ||
          "";

        await MessageRepository.create({
          id: key.id,
          ticketId: ticket.id,
          contactId: contact.id,
          content: content,
          type: MessageType.CLIENT,
          sentAt: new Date(data.messageTimestamp * 1000),
        });
        console.log(`Message created successfully: ${key.id}`);
      } catch (error) {
        console.error(`Error creating message: ${error}`);
        throw error;
      }
    } catch (error) {
      console.error('Error in handleMessagesUpsert:', error);
      throw error; // Re-throw to be caught by the controller
    }
  },

  // Placeholder methods for future implementation
  async handleQrCodeUpdated(payload: any): Promise<void> {
    // Implementation for QR code updates
    console.log('QR Code updated event received but not yet implemented');
  },

  async handleConnectionUpdate(payload: any): Promise<void> {
    // Implementation for connection status updates
    console.log('Connection update event received but not yet implemented');
  },

  async handleContactsUpdate(payload: any): Promise<void> {
    // Implementation for contact updates
    console.log('Contacts update event received but not yet implemented');
  },

  async handleContactsUpsert(payload: any): Promise<void> {
    // Implementation for contact creation/updates
    console.log('Contacts upsert event received but not yet implemented');
  }
}

