import { Request, Response } from "express";
import AgentService from "../services/AgentService";

export default {
  async index(req: Request, res: Response): Promise<void> {
    const agents = await AgentService.index(req.query);
    res.json(agents);
  },

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const agent = await AgentService.show({ id });
    res.json(agent);
  },

  async store(req: Request, res: Response): Promise<void> {
    const agent = await AgentService.store(req.body);
    res.status(201).json(agent);
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const agent = await AgentService.update(id, req.body);
    res.json(agent);
  },

  async destroy(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await AgentService.destroy(id);
    res.status(204).end();
  },
};
