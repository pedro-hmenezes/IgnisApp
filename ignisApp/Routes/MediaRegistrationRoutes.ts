import { Router } from 'express';
import MediaRegistrationController from '../Controllers/MediaRegistrationController.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = Router();

/**
 * @route POST /api/media/register
 * @desc Registra fotos já enviadas ao Cloudinary (upload direto do mobile)
 * @access Private
 */
router.post(
  '/register',
  authMiddleware,
  MediaRegistrationController.registerPhotos.bind(MediaRegistrationController)
);

/**
 * @route POST /api/media/register-single
 * @desc Registra foto única já enviada ao Cloudinary
 * @access Private
 */
router.post(
  '/register-single',
  authMiddleware,
  MediaRegistrationController.registerSinglePhoto.bind(MediaRegistrationController)
);

export default router;
