import { Request, Response } from 'express';
import {
  autenticarUsuario,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario
} from '../Services/UserService';
import { userSchema } from '../Validations/UserValidation';

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await autenticarUsuario(email, password);
    if (!result) return res.status(401).json({ message: 'Credenciais inválidas' });
    return res.json(result);
  } catch {
    return res.status(500).json({ message: 'Erro ao autenticar usuário' });
  }
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  // Força o role como 'operador' no momento do cadastro
  const data = { ...req.body, role: 'operador' };

  const validation = userSchema.safeParse(data);
  if (!validation.success) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: validation.error.format()
    });
  }

  try {
    const user = await criarUsuario(validation.data);
    return res.status(201).json(user);
  } catch {
    return res.status(400).json({ message: 'Erro ao registrar usuário' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'ID do usuário não fornecido.' });

  const validation = userSchema.partial().safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: 'Dados inválidos para atualização',
      errors: validation.error.format()
    });
  }

  try {
    const user = await atualizarUsuario(id, validation.data);
    return res.json(user);
  } catch {
    return res.status(400).json({ message: 'Erro ao atualizar usuário' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  try {
    const result = await excluirUsuario(id);
    return res.json(result);
  } catch {
    return res.status(400).json({ message: 'Erro ao excluir usuário' });
  }
};