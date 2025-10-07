import { Request, Response } from "express";
import ChannelService from "../services/ChannelService";

export default {
  async index(req: Request, res: Response): Promise<void> {
    const response = await ChannelService.index(req.query);
    res.json(response);
  },

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const response = await ChannelService.show({ id });
    res.json(response);
  },

  async store(req: Request, res: Response): Promise<void> {
    const response = await ChannelService.store(req.body);
    res.status(201).json(response);
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { payload } = req.body;
    const response = await ChannelService.update(id, payload);
    res.json(response);
  },

  async destroy(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await ChannelService.destroy(id);
    res.status(204);
  },

  async connect(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const response = await ChannelService.connect(id);
    res.json(response);
  },

  async getStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const response = await ChannelService.getStatus(id);
    res.json(response);
  },
};
