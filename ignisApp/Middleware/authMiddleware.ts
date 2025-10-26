import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'segredo';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido ou inválido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = {
    id: decoded.id,
    email: decoded.email, 
    role: decoded.role as 'operador' | 'major' | 'administrador'
  
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};