import { Router } from 'express';

import { createReport } from '../Controllers/ReportControllers.js';

const router = Router();

router.post('/', createReport);

export default router;