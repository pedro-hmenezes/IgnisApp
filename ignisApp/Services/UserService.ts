import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../Models/User.js';
import type { IUser } from '../Models/User.js';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo';

export const criarUsuario = async (data: IUser) => {
  try {
    const passwordHash = await bcrypt.hash(data.passwordHash, 10);
    const user = new UserModel({ ...data, passwordHash });
    const savedUser = await user.save();
    const { passwordHash: _, ...userData } = savedUser.toObject();
    return userData;
  } catch (error) {
    throw new Error(`Erro ao criar usuário: ${error}`);
  }
};

export const autenticarUsuario = async (email: string, password: string) => {
  try {
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    const { passwordHash: _, ...userData } = user.toObject();
    return { token, user: userData };
  } catch (error) {
    throw new Error(`Erro ao autenticar usuário: ${error}`);
  }
};

export const atualizarUsuario = async (id: string, data: Partial<IUser>) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }

    if (data.passwordHash) {
      data.passwordHash = await bcrypt.hash(data.passwordHash, 10);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new: true }).select('-passwordHash');
    return updatedUser;
  } catch (error) {
    throw new Error(`Erro ao atualizar usuário: ${error}`);
  }
};

export const excluirUsuario = async (id: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }

    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new Error('Usuário não encontrado');
    }

    return { message: 'Usuário excluído com sucesso' };
  } catch (error) {
    throw new Error(`Erro ao excluir usuário: ${error}`);
  }
};