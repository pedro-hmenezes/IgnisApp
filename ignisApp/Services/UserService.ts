import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../Models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo';

export const criarUsuario = async (data: any) => {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = new UserModel({ ...data, passwordHash });
  return await user.save();
};

export const autenticarUsuario = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) return null;
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  return { token, user };
};

export const atualizarUsuario = async (id: string, data: any) => {
  return await UserModel.findByIdAndUpdate(id, data, { new: true });
};