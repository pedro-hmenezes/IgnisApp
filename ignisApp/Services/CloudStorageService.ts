import { bucket } from '../Config/googleCloud.js';
import type { File as GCSFile } from '@google-cloud/storage';

export interface UploadResult {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
}

export interface DownloadResult {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
}

export class CloudStorageService {
    /**
     * Faz upload de um arquivo para Google Cloud Storage
     * @param fileBuffer - Buffer do arquivo
     * @param fileName - Nome do arquivo com extensão
     * @param mimeType - Tipo MIME do arquivo
     * @param folderPath - Caminho da pasta (ex: "ocorrencias/2024-12")
     */
    public async uploadFile(
        fileBuffer: Buffer,
        fileName: string,
        mimeType: string,
        folderPath: string = 'uploads'
    ): Promise<UploadResult> {
        try {
            // Criar nome único para evitar conflitos
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const uniqueFileName = `${timestamp}-${randomSuffix}-${fileName}`;
            const filePath = `${folderPath}/${uniqueFileName}`;

            const file = bucket.file(filePath);

            // Upload do arquivo
            await file.save(fileBuffer, {
                metadata: {
                    contentType: mimeType,
                    metadata: {
                        uploadedAt: new Date().toISOString(),
                        originalName: fileName,
                    },
                },
                public: false, // Arquivo privado, acesso via signed URL
                resumable: false,
            });

            // Gerar URL assinada (válida por 7 dias)
            const [signedUrl] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
            });

            return {
                fileName: uniqueFileName,
                fileUrl: signedUrl,
                fileSize: fileBuffer.length,
                mimeType,
                uploadedAt: new Date(),
            };
        } catch (error) {
            console.error('Erro ao fazer upload para GCS:', error);
            throw new Error('Falha ao fazer upload do arquivo para a nuvem');
        }
    }

    /**
     * Faz upload de múltiplos arquivos
     */
    public async uploadMultipleFiles(
        files: { buffer: Buffer; originalName: string; mimeType: string }[],
        folderPath: string = 'uploads'
    ): Promise<UploadResult[]> {
        const results = await Promise.all(
            files.map((file) =>
                this.uploadFile(file.buffer, file.originalName, file.mimeType, folderPath)
            )
        );
        return results;
    }

    /**
     * Faz download de um arquivo do Google Cloud Storage
     */
    public async downloadFile(filePath: string): Promise<DownloadResult> {
        try {
            const file = bucket.file(filePath);

            const [exists] = await file.exists();
            if (!exists) {
                throw new Error('Arquivo não encontrado');
            }

            const [buffer] = await file.download();
            const [metadata] = await file.getMetadata();

            return {
                buffer,
                fileName: filePath.split('/').pop() || 'arquivo',
                mimeType: metadata.contentType || 'application/octet-stream',
            };
        } catch (error) {
            console.error('Erro ao fazer download do arquivo:', error);
            throw new Error('Falha ao fazer download do arquivo');
        }
    }

    /**
     * Deleta um arquivo do Google Cloud Storage
     */
    public async deleteFile(filePath: string): Promise<void> {
        try {
            const file = bucket.file(filePath);
            await file.delete();
            console.log(`✅ Arquivo deletado: ${filePath}`);
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            throw new Error('Falha ao deletar o arquivo');
        }
    }

    /**
     * Deleta múltiplos arquivos
     */
    public async deleteMultipleFiles(filePaths: string[]): Promise<void> {
        await Promise.all(filePaths.map((path) => this.deleteFile(path)));
    }

    /**
     * Lista arquivos em uma pasta
     */
    public async listFiles(folderPath: string = 'uploads'): Promise<string[]> {
        try {
            const [files] = await bucket.getFiles({
                prefix: folderPath,
            });

            return files.map((file: GCSFile) => file.name);
        } catch (error) {
            console.error('Erro ao listar arquivos:', error);
            throw new Error('Falha ao listar arquivos');
        }
    }

    /**
     * Gera uma URL assinada para um arquivo existente
     */
    public async getSignedUrl(
        filePath: string,
        expiresIn: number = 7 * 24 * 60 * 60 * 1000 // 7 dias
    ): Promise<string> {
        try {
            const file = bucket.file(filePath);
            const [signedUrl] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + expiresIn,
            });
            return signedUrl;
        } catch (error) {
            console.error('Erro ao gerar URL assinada:', error);
            throw new Error('Falha ao gerar URL assinada');
        }
    }

    /**
     * Obtém informações sobre um arquivo
     */
    public async getFileMetadata(filePath: string): Promise<any> {
        try {
            const file = bucket.file(filePath);
            const [metadata] = await file.getMetadata();
            return metadata;
        } catch (error) {
            console.error('Erro ao obter metadados:', error);
            throw new Error('Falha ao obter informações do arquivo');
        }
    }
}

export default new CloudStorageService();
