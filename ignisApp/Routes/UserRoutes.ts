import { Router } from 'express';
import { login, register, updateUser } from '../Controllers/UserControllers.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.put('/user/:id', authMiddleware, updateUser);

export default router;