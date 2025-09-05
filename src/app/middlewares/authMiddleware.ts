import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.cookies?.userId ?? null;

  if (!userId) {
    return res.status(401).json({
      message: "Oops! Você precisa estar autenticado para acessar este recurso.",
    });
  }

  next();
}
