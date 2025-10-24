import { Request, Response } from "express";
import TicketService from "../services/TicketService";

export default {
  async index(req: Request, res: Response) {
    const tickets = await TicketService.index(req.query);
    res.json(tickets);
  },

  async show(req: Request, res: Response) {
    const ticket = await TicketService.show({ id: req.params.id });
    res.json(ticket);
  },

  async store(req: Request, res: Response) {
    const ticket = await TicketService.store(req.body);
    res.status(201).json(ticket);
  },

  async update(req: Request, res: Response) {
    const ticket = await TicketService.update(req.params.id, req.body);
    res.json(ticket);
  },

  async destroy(req: Request, res: Response) {
    await TicketService.destroy(req.params.id);
    res.status(204).end();
  },

  async toggleAI(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const ticket = await TicketService.toggleAI(id);
    res.json(ticket);
  },
};
