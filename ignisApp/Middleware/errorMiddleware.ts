import type { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Erro] ${err.name}: ${err.message}`);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    sucesso: false,
    mensagem: err.message || 'Erro interno do servidor',
    detalhes: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};