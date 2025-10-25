// types.d.ts
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'operador' | 'major' | 'administrador';
      };
    }
  }
}

export {};