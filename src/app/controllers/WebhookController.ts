import {Request, Response} from "express";
import WebhookService from "../services/WebhookService";

export default {
  async evolutionHandle(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;
      
      if (!payload || !payload.event) {
        console.error('Invalid webhook payload: missing event type');
        res.status(400).json({ error: 'Invalid webhook payload: missing event type' });
        return;
      }
      
      console.log(`Processing webhook event: ${payload.event}`);
      
      switch (payload.event) {
        case 'messages.upsert':
          await WebhookService.handleMessagesUpsert(payload);
          break;
        case 'qrcode.updated':
          // To be implemented
          // await WebhookService.handleQrCodeUpdated(payload);
          break;
        case 'connection.update':
          // To be implemented
          // await WebhookService.handleConnectionUpdate(payload);
          break;
        case 'contacts.update':
          // To be implemented
          // await WebhookService.handleContactsUpdate(payload);
          break;
        case 'contacts.upsert':
          // To be implemented
          // await WebhookService.handleContactsUpsert(payload);
          break;
        default:
          console.log(`Unhandled webhook event: ${payload.event}`);
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Internal server error processing webhook' });
    }
  }
}
