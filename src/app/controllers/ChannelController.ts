import { Request, Response } from 'express'
import ChannelService from '../services/ChannelService';

export default {
  async index(req: Request, res: Response) {
    const response = await ChannelService.getAll(req.query)
    res.json(response)
  },

  async show(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) return res.status(404).json({error: 'Canal não encontrado!'})

    const response = await ChannelService.getById(id)
    res.status(200).json(response)
  },

  async store(req: Request, res: Response) {
    try {
      const response = await ChannelService.create(req.body)
      res.status(201).json(response)
    } catch (error) {
      return res.status(400).json({error: `Erro ao cadastrar: ${error}!`})
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(404).json({error: 'Canal não encontrado!'})

      const { payload } = req.body;
      const response = await ChannelService.update(id, payload)
      res.status(200).json(response)
    } catch (error) {
      return res.status(400).json({error: `Erro ao atualizar: ${error}!`})
    }
  },

  async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(404).json({error: 'Canal não encontrado!'})

      await ChannelService.delete(id)
      res.status(204).end()
    } catch (error) {
      return res.status(400).json({error: `Erro ao excluir: ${error}!`})
    }
  },

  async connect(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(404).json({error: 'Canal não encontrado!'})
      const response = await ChannelService.connect(id)
      res.status(200).json(response)
    } catch (error) {
      return res.status(400).json({error: `Erro ao obter QR Code: ${error}!`})
    }
  },

  async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(404).json({error: 'Canal não encontrado!'})
      const response = await ChannelService.getStatus(id)
      res.status(200).json(response)
    } catch (error) {
      return res.status(400).json({error: `Erro ao obter Status: ${error}!`})
    }
  }
}
