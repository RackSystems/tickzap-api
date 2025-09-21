import {Request, Response} from 'express';
import UserService from '../services/UserService';

export default {
  async index(req: Request, res: Response): Promise<void> {
    const users = await UserService.index(req.query);
    res.json(users);
  },

  async show(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    const user = await UserService.show(id);
    res.json(user);
  },

  async store(req: Request, res: Response): Promise<void> {
    const user = await UserService.store(req.body);
    res.status(201).json(user);
  },

  async update(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    const {password: _, ...safeData} = req.body;
    const user = await UserService.update(id, safeData);
    res.json(user);
  },

  async destroy(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    await UserService.destroy(id);
    res.status(204).end();
  },

  async changeStatus(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    const {status} = req.body;
    const user = await UserService.changeStatus(id, status);
    res.json(user);
  },

  async enableOrDisable(req: Request, res: Response): Promise<void> {
    const {id} = req.params;
    const user = await UserService.enableOrDisable(id);
    res.json(user);
  }
};
