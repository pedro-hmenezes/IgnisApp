import { Router } from 'express';
import {
  login,
  register,
  updateUser,
  deleteUser
} from '../Controllers/UserControllers.js';
 import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = Router();

// Login
router.post('/login', login);

// Cadastro de usuário
// Mantém a rota antiga '/register' por compatibilidade
router.post('/register', register);
// E expõe também POST '/' para clientes que chamam /api/users
router.post('/', register);
// router.put('/user/:id', authMiddleware, updateUser); // <<<< COMENTAR
// router.delete('/user/:id', authMiddleware, deleteUser); // <<<< COMENTAR

export default router;
