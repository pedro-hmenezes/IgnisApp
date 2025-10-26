import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../Models/User';
import { IUser } from '../Interfaces/UserInterface';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo';

export const criarUsuario = async (data: IUser) => {
  const passwordHash = await bcrypt.hash(data.passwordHash, 10);
  const user = new UserModel({ ...data, passwordHash });
  const savedUser = await user.save();
  const { passwordHash: _, ...userData } = savedUser.toObject();
  return userData;
};

export const autenticarUsuario = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select('+passwordHash');
  if (!user) return null;

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  const { passwordHash: _, ...userData } = user.toObject();
  return { token, user: userData };
};

export const atualizarUsuario = async (id: string, data: Partial<IUser>) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('ID inválido');

  const updateData = { ...data };
  if (data.passwordHash) {
    updateData.passwordHash = await bcrypt.hash(data.passwordHash, 10);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
  return updatedUser;
};

export const excluirUsuario = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('ID inválido');

  const deletedUser = await UserModel.findByIdAndDelete(id);
  if (!deletedUser) throw new Error('Usuário não encontrado');

  return { message: 'Usuário excluído com sucesso' };
};
