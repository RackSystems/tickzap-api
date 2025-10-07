// @ts-ignore
import {Request, Response, NextFunction} from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const userId = req.cookies?.userId ?? null;

  if (!userId) {
    res.status(401).json({
      message: "Oops! Você precisa estar autenticado para acessar este recurso.",
    });
    return;
  }

  // @ts-ignore
  req.user = { id: userId };

  next();
}
