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

let storage: Storage | null = null;
let bucket: any = null;

// ⚠️ GOOGLE CLOUD STORAGE DESABILITADO - USANDO CLOUDINARY
// Descomente abaixo se precisar voltar a usar GCS
/*
try {
    if (process.env.GCP_SERVICE_ACCOUNT_JSON) {
        const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);

        storage = new Storage({
            projectId,
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key,
            },
        });

    } else {
        // Usa GOOGLE_APPLICATION_CREDENTIALS (ambiente do Google Cloud)
        storage = new Storage({ projectId });
    }

    bucket = storage.bucket(bucketName!);
    console.log('✅ Google Cloud Storage inicializado com sucesso');
} catch (error) {
    console.error('❌ Erro ao inicializar Google Cloud Storage:', error);
    throw new Error('Falha na inicialização do Google Cloud Storage');
}
*/

console.log('ℹ️ Google Cloud Storage desabilitado - Usando Cloudinary');

export { storage, bucket };
