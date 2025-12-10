import { Router } from 'express';
import CloudinaryMediaController from '../Controllers/CloudinaryMediaController.js';
import { uploadMediaCloudinary } from '../Middleware/uploadMediaCloudinary.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = Router();

/**
 * @route POST /api/media/cloudinary/upload
 * @desc Upload de arquivo único para Cloudinary
 * @access Private
 */
router.post(
  '/upload',
  authMiddleware,
  uploadMediaCloudinary.single('media'),
  CloudinaryMediaController.uploadSingle.bind(CloudinaryMediaController)
);

/**
 * @route POST /api/media/cloudinary/upload-multiple
 * @desc Upload de múltiplos arquivos para Cloudinary
 * @access Private
 */
router.post(
  '/upload-multiple',
  authMiddleware,
  uploadMediaCloudinary.array('media', 10),
  CloudinaryMediaController.uploadMultiple.bind(CloudinaryMediaController)
);

/**
 * @route DELETE /api/media/cloudinary/:id
 * @desc Deletar arquivo do Cloudinary e do banco
 * @access Private
 */
router.delete(
  '/:id',
  authMiddleware,
  CloudinaryMediaController.deleteMedia.bind(CloudinaryMediaController)
);

export default router;
