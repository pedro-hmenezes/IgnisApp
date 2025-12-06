import { MediaModel } from '../Models/Media.js';
import type { IMedia } from '../Models/Media.js';
import CloudStorageService from './CloudStorageService.js';
import mongoose from 'mongoose';

export class MediaService {
    /**
     * Cria um registro de mídia com upload para Google Cloud Storage
     */
    public async create(mediaData: Partial<IMedia>): Promise<IMedia> {
        const media = new MediaModel(mediaData);
        return await media.save();
    }

    /**
     * Faz upload de arquivo para GCS e cria registro no banco
     */
    public async uploadToCloud(
        fileBuffer: Buffer,
        originalName: string,
        mimeType: string,
        userId?: string,
        occurrenceId?: string,
        folderPath: string = 'uploads'
    ): Promise<IMedia> {
        // Upload para Google Cloud Storage
        const uploadResult = await CloudStorageService.uploadFile(
            fileBuffer,
            originalName,
            mimeType,
            folderPath
        );

        // Determinar tipo de arquivo
        const fileType = mimeType.startsWith('image/')
            ? 'image'
            : mimeType.startsWith('video/')
                ? 'video'
                : mimeType.startsWith('application/')
                    ? 'document'
                    : 'unknown';

        // Criar registro no banco de dados
        const mediaData: Partial<IMedia> = {
            name: originalName,
            fileType: fileType as any,
            filePath: uploadResult.fileName,
            fileUrl: uploadResult.fileUrl,
            size: uploadResult.fileSize,
            mimeType,
            uploaded: true,
            cloudStorage: true,
            capturedAt: uploadResult.uploadedAt,
            uploadedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
            occurrenceId: occurrenceId ? new mongoose.Types.ObjectId(occurrenceId) : undefined,
        };

        return await this.create(mediaData);
    }

    /**
     * Faz upload em lote
     */
    public async uploadMultiple(
        files: { buffer: Buffer; originalName: string; mimeType: string }[],
        userId?: string,
        occurrenceId?: string,
        folderPath: string = 'uploads'
    ): Promise<IMedia[]> {
        const mediaList = await Promise.all(
            files.map((file) =>
                this.uploadToCloud(
                    file.buffer,
                    file.originalName,
                    file.mimeType,
                    userId,
                    occurrenceId,
                    folderPath
                )
            )
        );
        return mediaList;
    }

    /**
     * Obtém todos os registros de mídia
     */
    public async getAll(): Promise<IMedia[]> {
        return await MediaModel.find().populate('uploadedBy occurrenceId');
    }

    /**
     * Obtém mídia por ID
     */
    public async getById(id: string): Promise<IMedia | null> {
        return await MediaModel.findById(id).populate('uploadedBy occurrenceId');
    }

    /**
     * Obtém mídia por ocorrência
     */
    public async getByOccurrenceId(occurrenceId: string): Promise<IMedia[]> {
        return await MediaModel.find({ occurrenceId }).populate('uploadedBy');
    }

    /**
     * Atualiza registro de mídia
     */
    public async update(id: string, updateData: Partial<IMedia>): Promise<IMedia | null> {
        return await MediaModel.findByIdAndUpdate(id, updateData, { new: true }).populate(
            'uploadedBy occurrenceId'
        );
    }

    /**
     * Deleta mídia e arquivo do GCS
     */
    public async delete(id: string): Promise<void> {
        const media = await MediaModel.findById(id);
        if (!media) {
            throw new Error('Mídia não encontrada');
        }

        // Deletar do Google Cloud Storage
        if (media.cloudStorage && media.filePath) {
            await CloudStorageService.deleteFile(media.filePath);
        }

        // Deletar registro do banco
        await MediaModel.findByIdAndDelete(id);
    }

    /**
     * Deleta múltiplas mídias
     */
    public async deleteMultiple(ids: string[]): Promise<void> {
        const medias = await MediaModel.find({ _id: { $in: ids } });

        // Deletar do GCS
        for (const media of medias) {
            if (media.cloudStorage && media.filePath) {
                await CloudStorageService.deleteFile(media.filePath);
            }
        }

        // Deletar registros
        await MediaModel.deleteMany({ _id: { $in: ids } });
    }

    /**
     * Obtém URL assinada para um arquivo
     */
    public async getSignedUrl(id: string, expiresIn?: number): Promise<string> {
        const media = await MediaModel.findById(id);
        if (!media || !media.filePath) {
            throw new Error('Mídia não encontrada');
        }

        return await CloudStorageService.getSignedUrl(media.filePath, expiresIn);
    }

    /**
     * Lista arquivos de uma pasta no GCS
     */
    public async listFolder(folderPath: string): Promise<string[]> {
        return await CloudStorageService.listFiles(folderPath);
    }
}