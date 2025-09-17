import {Request, Response} from 'express'
import ContactService from '../services/ContactService'

export default {
  async index(req: Request, res: Response) {
    const contact = await ContactService.index(req.query)
    res.json(contact)
  },

  async show(req: Request, res: Response) {
    const contact = await ContactService.show({id: req.params.id})
    res.json(contact)
  },

  async store(req: Request, res: Response) {
    const contact = await ContactService.store(req.body)
    res.status(201).json(contact)
  },

  async update(req: Request, res: Response) {
    const {password: _, ...safeData} = req.body;
    const contact = await ContactService.update(req.params.id, safeData)
    res.json(contact)
  },

  async destroy(req: Request, res: Response) {
    await ContactService.destroy(req.params.id)
    res.status(204).end()
  }
}
