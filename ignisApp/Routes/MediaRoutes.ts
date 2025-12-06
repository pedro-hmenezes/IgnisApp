import { Router } from 'express';
import { MediaController } from '../Controllers/MediaControllers.js';
import { uploadMedia } from '../Middleware/uploadMedia.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = Router();
const mediaController = new MediaController();

/**
 * Rotas de Mídia (Fotos e Vídeos)
 * Base: /api/media
 */

// Upload de arquivo único
router.post(
    '/upload',
    authMiddleware,
    uploadMedia.single('media'),
    (req, res) => mediaController.uploadSingle(req, res)
);

// Upload de múltiplos arquivos
router.post(
    '/upload-multiple',
    authMiddleware,
    uploadMedia.array('media', 10),
    (req, res) => mediaController.uploadMultiple(req, res)
);

// Download de arquivo
router.get('/download/:id', (req, res) => mediaController.download(req, res));

// Obter URL assinada
router.get('/signed-url/:id', (req, res) => mediaController.getSignedUrl(req, res));

// Listar todos os arquivos
router.get('/', (req, res) => mediaController.getAll(req, res));

// Obter arquivo por ID
router.get('/:id', (req, res) => mediaController.getById(req, res));

// Obter arquivos de uma ocorrência
router.get('/occurrence/:occurrenceId', (req, res) =>
    mediaController.getByOccurrenceId(req, res)
);

// Deletar arquivo
router.delete('/:id', authMiddleware, (req, res) => mediaController.delete(req, res));

// Deletar múltiplos arquivos
router.delete('/delete-multiple', authMiddleware, (req, res) =>
    mediaController.deleteMultiple(req, res)
);

export default router;