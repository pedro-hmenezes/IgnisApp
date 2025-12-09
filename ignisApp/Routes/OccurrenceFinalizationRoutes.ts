import { Router } from 'express';
import OccurrenceFinalizationController from '../Controllers/OccurrenceFinalizationController.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = Router();

/**
 * @route PATCH /api/occurrences/:id/finalize
 * @desc Finaliza ocorrência completamente (Relatório + GPS + Assinatura + Fotos)
 * @access Private
 */
router.patch(
    '/:id/finalize',
    authMiddleware,
    OccurrenceFinalizationController.finalizeComplete.bind(OccurrenceFinalizationController)
);

/**
 * @route GET /api/occurrences/:id/finalization-details
 * @desc Busca detalhes completos da finalização
 * @access Private
 */
router.get(
    '/:id/finalization-details',
    authMiddleware,
    OccurrenceFinalizationController.getFinalizationDetails.bind(OccurrenceFinalizationController)
);

export default router;
