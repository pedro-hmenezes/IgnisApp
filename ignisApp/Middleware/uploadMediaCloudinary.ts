import multer from 'multer';
import CloudinaryStorage from 'multer-storage-cloudinary';
import cloudinary from '../Config/cloudinary.js';

/**
 * Configuração do Multer com Cloudinary Storage
 * Arquivos são enviados diretamente para o Cloudinary
 */

// Configurar storage do Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Express.Request, file: Express.Multer.File) => {
    // Determinar tipo de recurso
    const isVideo = file.mimetype.startsWith('video/');
    
    return {
      folder: 'ignisapp/occurrences', // Pasta no Cloudinary
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi'],
      transformation: isVideo 
        ? undefined // Sem transformação para vídeos
        : [{ width: 1920, height: 1080, crop: 'limit' }], // Otimizar imagens
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // Nome único
    };
  },
});

// Filtro de tipos de arquivos
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime', // MOV
    'video/x-msvideo', // AVI
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`❌ Tipo de arquivo não permitido: ${file.mimetype}`));
  }
};

// Limites de tamanho
const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB
  files: 10, // Máximo de 10 arquivos por requisição
};

// Exportar middleware configurado
export const uploadMediaCloudinary = multer({ 
  storage, 
  fileFilter, 
  limits 
});

/**
 * Uso:
 * - Arquivo único: uploadMediaCloudinary.single('media')
 * - Múltiplos arquivos: uploadMediaCloudinary.array('media', 10)
 */
