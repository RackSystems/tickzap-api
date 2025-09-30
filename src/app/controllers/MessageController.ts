import {Request, Response} from 'express'
import MessageService from "../services/MessageService";

export default {
  async index(req: Request, res: Response) {
    const ticketId = req.params.id as string | undefined;

    if (!ticketId) {
      res.status(400).json({error: 'ticketId is required in route params'});
      return;
    }

    const message = await MessageService.index(ticketId)
    res.json(message)
  },

  async show(req: Request, res: Response) {
    const message = await MessageService.show({id: req.params.id})
    res.json(message)
  },

  async store(req: Request, res: Response) {
    const message = await MessageService.store(req.body)
    res.status(201).json(message)
  },

  //todo audioMessage - https://doc.evolution-api.com/v1/api-reference/message-controller/send-audio
}