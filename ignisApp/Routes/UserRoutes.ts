import { Router } from 'express';
import {
  login,
  register,
  updateUser,
  deleteUser
} from '../Controllers/UserControllers';
import { authMiddleware } from '../Middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.put('/user/:id', authMiddleware, updateUser);
router.delete('/user/:id', authMiddleware, deleteUser);

export default router;