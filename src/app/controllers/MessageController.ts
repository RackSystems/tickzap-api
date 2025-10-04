import {Request, Response} from 'express'
import MessageService from "../services/MessageService";

export default {
  async index(req: Request, res: Response): Promise<void> {
    const ticketId = req.params.id as string | undefined;

    if (!ticketId) {
      res.status(400).json({error: 'ticketId is required in route params'});
      return;
    }

    const message = await MessageService.index(ticketId)
    res.json(message)
  },

  async show(req: Request, res: Response): Promise<void> {
    const message = await MessageService.show({id: req.params.id})
    res.json(message)
  },

  async store(req: Request, res: Response): Promise<void> {
    const message = await MessageService.store(req.body)
    res.status(201).json(message)
  },

  //send messages by tickzap using evolution integration
  async sendMessage(req: Request, res: Response): Promise<void> {
    const message = await MessageService.sendMessage(req.body)
    res.json(message)
  }
}