import {NextFunction, Request, Response} from 'express';
import HttpException from '../exceptions/HttpException';
import {Prisma} from '@prisma/client';

const PRISMA_TO_HTTP: Record<string, number> = {
  P2025: 404,
  P2002: 409,
  P2003: 409
};

const ErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof HttpException) {
    res.status(err.status).json({error: err.message});
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const status = PRISMA_TO_HTTP[err.code] ?? 400;
    res.status(status).json({error: err.message});
  }

  res.status(500).json({error: 'Erro interno do servidor.'});
};

export default ErrorHandler;
