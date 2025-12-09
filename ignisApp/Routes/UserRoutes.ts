import { Router } from 'express';
import {
  login,
  register,
  updateUser,
  deleteUser,
  listUsers,
  getUserById
} from '../Controllers/UserControllers.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = Router();

// Autenticação
router.post('/login', login);
router.post('/register', register);

// CRUD de Usuários (requer autenticação)
router.get('/', authMiddleware, listUsers);              // Listar todos os usuários
router.get('/:id', authMiddleware, getUserById);          // Buscar usuário por ID
router.post('/', register);                               // Criar usuário (compatibilidade)
router.put('/:id', authMiddleware, updateUser);           // Atualizar usuário
router.delete('/:id', authMiddleware, deleteUser);        // Excluir usuário

export default router;
