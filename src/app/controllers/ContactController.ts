import { Request, Response } from 'express'
import ContactService from '../services/ContactService'

export default {
  async index(req: Request, res: Response) {
    const contact = await ContactService.getAll(req.query)
    res.json(contact)
  },

  async show(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) return res.status(404).json({error: 'Contato não encontrado!'})

    const contact = await ContactService.getById(id)
    res.status(200).json(contact)
  },

  async store(req: Request, res: Response) {
    try {
      const contact = await ContactService.create(req.body)
      res.status(201).json(contact)
    } catch (error) {
      return res.status(400).json({error: `Erro ao cadastrar contato: ${error}!`})
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(404).json({error: 'Contato não encontrado!'})

      const { password: _, ...safeData } = req.body;
      const contact = await ContactService.update(id, safeData)
      res.status(200).json(contact)
    } catch (error) {
      return res.status(400).json({error: `Erro ao atualizar contato: ${error}!`})
    }
  },

  async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(404).json({error: 'Contato não encontrado!'})

      await ContactService.delete(id)
      res.status(204).end()
    } catch (error) {
      return res.status(400).json({error: `Erro ao excluir contato: ${error}!`})
    }
  }
}
