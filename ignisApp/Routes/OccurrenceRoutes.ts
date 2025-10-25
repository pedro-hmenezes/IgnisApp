import { Router } from 'express';
import {
  createOccurrence,
  getOccurrences,
  getOccurrenceById,
  updateOccurrence,
  cancelOccurrence,
} from '../Controllers/OccurrenceControllers.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = Router();

// Todas as rotas protegidas por JWT
router.use(authMiddleware);

// Criar ocorrência
router.post('/', createOccurrence);

// Listar ocorrências
router.get('/', getOccurrences);

// Buscar ocorrência por ID
router.get('/:id', getOccurrenceById);

// Atualizar ocorrência
router.patch('/:id', updateOccurrence);

// Cancelar ocorrência
router.patch('/:id/cancel', cancelOccurrence);

export default router;