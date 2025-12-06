import { Router } from 'express';
import SignatureController from '../Controllers/SignatureControllers.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = Router();

/**
 * Rotas de Assinatura Digital
 * Base: /api/signatures
 */

/**
 * Assinar ocorrência (finalizar com assinatura)
 * POST /api/signatures/sign
 * Requer: occurrenceId, signerName, signatureData
 * Opcional: signerRole, screenResolution
 */
router.post('/sign', authMiddleware, (req, res) =>
    SignatureController.signOccurrence(req, res)
);

/**
 * Obter assinatura de uma ocorrência
 * GET /api/signatures/occurrence/:occurrenceId
 */
router.get('/occurrence/:occurrenceId', (req, res) =>
    SignatureController.getSignatureByOccurrence(req, res)
);

/**
 * Obter assinatura por ID
 * GET /api/signatures/:signatureId
 */
router.get('/:signatureId', (req, res) =>
    SignatureController.getSignatureById(req, res)
);

/**
 * Listar assinaturas do usuário
 * GET /api/signatures/user/my-signatures
 */
router.get('/user/my-signatures', authMiddleware, (req, res) =>
    SignatureController.getUserSignatures(req, res)
);

/**
 * Atualizar assinatura
 * PATCH /api/signatures/:signatureId
 * Requer autenticação
 */
router.patch('/:signatureId', authMiddleware, (req, res) =>
    SignatureController.updateSignature(req, res)
);

/**
 * Deletar assinatura
 * DELETE /api/signatures/:signatureId
 * Requer autenticação
 */
router.delete('/:signatureId', authMiddleware, (req, res) =>
    SignatureController.deleteSignature(req, res)
);

/**
 * Obter estatísticas de assinaturas
 * GET /api/signatures/stats/all
 */
router.get('/stats/all', authMiddleware, (req, res) =>
    SignatureController.getSignatureStats(req, res)
);

export default router;
