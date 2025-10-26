export interface IUser {
  name: string;
  email: string;
  role: 'operador' | 'major' | 'administrador';
  passwordHash: string;
}