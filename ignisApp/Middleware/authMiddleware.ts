import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'segredo';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token || typeof token !== 'string') {
    return res.status(401).json({ message: 'Token não fornecido ou inválido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === 'string') {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.user = decoded as {
      id: string;
      role: 'operador' | 'major' | 'administrador';
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};