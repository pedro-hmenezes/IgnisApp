import type { Request, Response } from 'express';
import {
  autenticarUsuario,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario
} from '../Services/UserService.js';

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  try {
    const result = await autenticarUsuario(email, password);
    if (!result) return res.status(401).json({ message: 'Credenciais inválidas' });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao autenticar usuário', error });
  }
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await criarUsuario(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ message: 'Erro ao registrar usuário', error });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'ID do usuário não fornecido.' });
    }

    const user = await atualizarUsuario(id, req.body);
    return res.json(user);
  } catch (error) {
    return res.status(400).json({ message: 'Erro ao atualizar usuário', error });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id;
    const result = await excluirUsuario(id);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: 'Erro ao excluir usuário', error });
  }
};