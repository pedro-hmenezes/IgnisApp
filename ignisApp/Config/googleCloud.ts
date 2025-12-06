import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuração do Google Cloud Storage
 * Variáveis de ambiente necessárias:
 * - GCS_PROJECT_ID: ID do projeto Google Cloud
 * - GCS_BUCKET_NAME: Nome do bucket no Google Cloud Storage
 * - GCS_KEY_FILE: Caminho para o arquivo de credenciais JSON (opcional)
 */

const projectId = process.env.GCS_PROJECT_ID;
const bucketName = process.env.GCS_BUCKET_NAME;
const keyFilePath = process.env.GCS_KEY_FILE;

let storage: Storage;

try {
    if (keyFilePath) {
        // Se tiver arquivo de credenciais local
        storage = new Storage({
            projectId,
            keyFilename: keyFilePath,
        });
    } else {
        // Usa credenciais de ambiente (recomendado em produção)
        storage = new Storage({
            projectId,
        });
    }

    console.log('✅ Google Cloud Storage inicializado com sucesso');
} catch (error) {
    console.error('❌ Erro ao inicializar Google Cloud Storage:', error);
    throw new Error('Falha na inicialização do Google Cloud Storage');
}

if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME não configurado no ambiente');
}

export const bucket = storage.bucket(bucketName);
export default storage;
