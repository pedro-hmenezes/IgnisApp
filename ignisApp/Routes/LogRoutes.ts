import { Router } from 'express';
import { getLogs } from '../Controllers/LogControllers';

const router = Router();

router.get('/logs', getLogs);

export default router;