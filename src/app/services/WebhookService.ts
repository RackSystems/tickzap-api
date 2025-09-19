import ChannelRepository from "../repositories/ChannelRepository";
import ContactRepository from "../repositories/ContactRepository";
import TicketRepository from "../repositories/TicketRepository";
import MessageRepository from "../repositories/MessageRepository";
import {MessageType, TicketStatus} from ".prisma/client";

export default {
  // Legacy method - will be deprecated
  async handleEvolution(payload: any): Promise<void> {
    console.warn('handleEvolution method is deprecated. Use specific event handlers instead.');
    if (payload.event === "messages.upsert") {
      await this.handleMessagesUpsert(payload);
    }
  },

  async handleMessagesUpsert(payload: any): Promise<void> {
    try {
      // Validate required fields
      if (!payload.instance || !payload.data || !payload.sender) {
        console.error('Invalid messages.upsert payload: missing required fields');
        return;
      }
      
      const {instance, data, sender} = payload;
      
      if (!data.key || !data.message) {
        console.error('Invalid messages.upsert payload: missing key or message data');
        return;
      }
      
      const {key, message, pushName} = data;

      // Skip messages sent by us
      if (key.fromMe) {
        console.log('Skipping message sent by the system');
        return;
      }

      console.log(`Processing message from ${sender} to channel ${instance}`);
      
      // Find or create channel
      const channel = await ChannelRepository.findByName(instance);
      if (!channel) {
        console.error(`Channel with name ${instance} not found`);
        return;
      }

      // Find or create contact
      let contact;
      try {
        contact = await ContactRepository.findByRemoteJid(sender);
        if (!contact) {
          console.log(`Creating new contact for ${sender}`);
          contact = await ContactRepository.create({
            name: pushName || 'Unknown',
            remoteJid: sender,
            channelId: channel.id,
          });
        }
      } catch (error) {
        console.error(`Error finding/creating contact: ${error}`);
        throw error;
      }

      // Find or create ticket
      let ticket;
      try {
        ticket = await TicketRepository.findOpenByContactAndChannel(contact.id, channel.id);
        if (!ticket) {
          console.log(`Creating new ticket for contact ${contact.id}`);
          ticket = await TicketRepository.create({
            contactId: contact.id,
            channelId: channel.id,
            status: TicketStatus.PENDING,
          });
        }
      } catch (error) {
        console.error(`Error finding/creating ticket: ${error}`);
        throw error;
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

