import multer from 'multer';
import path from 'path';

/**
 * Configuração do Multer para captura de arquivos em memória
 * Arquivos são armazenados em buffer antes do upload para GCS
 */

// Armazenamento em memória
const storage = multer.memoryStorage();

// Filtro de tipos de arquivos
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/quicktime', // MOV
        'video/x-msvideo', // AVI
        'application/pdf',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`❌ Tipo de arquivo não permitido: ${file.mimetype}`));
    }
};

// Limites de tamanho
const limits = {
    fileSize: 500 * 1024 * 1024, // 500MB para vídeos
    files: 10, // Máximo de arquivos por requisição
};

// Exportar middleware configurado
export const uploadMedia = multer({ storage, fileFilter, limits });

/**
 * Middleware para múltiplos arquivos
 * Uso: uploadMedia.array('media', 10)
 */

/**
 * Middleware para arquivo único
 * Uso: uploadMedia.single('media')
 */