import type { Request, Response, NextFunction } from 'express';
import { registerLog } from '../Services/LogService';
import { IUser } from '../Interfaces/UserInterface';

export const logMiddleware = (actionDescription: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user?.email || req.user?.id || 'Usuário não identificado';
      const details = `Rota: ${req.originalUrl} | Método: ${req.method}`;

      await registerLog(actionDescription, details, user);
    } catch (error) {
      console.error('Erro ao registrar log automático:', error);
    }

    next();
  };
};