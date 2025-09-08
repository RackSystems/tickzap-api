import {Request, Response} from 'express';

export async function handle(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body as WebhookPayload;

    handleEvent(payload.event, payload.data);

    res.status(200).json({ok: true});
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ok: false, error: 'Internal server error'});
  }
}

export function handleEvent(event: string, data: any): void {
  console.log(event, data);
}