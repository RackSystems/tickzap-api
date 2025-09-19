import MessageService from "../services/MessageService";

export default {
  async index(req: Request, res: Response) {
    const message = await MessageService.index(req.query)
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
}