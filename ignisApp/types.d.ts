// types.d.ts
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      role: 'operador' | 'major' | 'administrador';
    };
  }
}
