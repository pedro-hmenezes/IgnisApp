import type { Request, Response } from 'express';
import { MediaService } from '../Services/MediaService.js';
import CloudStorageService from '../Services/CloudStorageService.js';

const mediaService = new MediaService();

export class MediaController {
    /**
     * Upload de arquivo único para Google Cloud Storage
     */
    public async uploadSingle(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.file) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ Nenhum arquivo enviado.',
                });
            }

            const { originalname, mimetype, buffer, size } = req.file;
            const { occurrenceId } = req.body;
            const userId = req.user?.id;

            // Determinar pasta baseado no tipo de arquivo
            const folderPath = mimetype.startsWith('video/') ? 'videos' : 'images';

            // Upload e criação de registro
            const media = await mediaService.uploadToCloud(
                buffer,
                originalname,
                mimetype,
                userId,
                occurrenceId,
                folderPath
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: '✅ Arquivo enviado com sucesso!',
                dados: media,
            });
        } catch (error) {
            console.error('Erro no upload:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao fazer upload do arquivo.',
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    }

    /**
     * Upload de múltiplos arquivos
     */
    public async uploadMultiple(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ Nenhum arquivo enviado.',
                });
            }

            const files = Array.isArray(req.files) ? req.files : [req.files];
            const { occurrenceId } = req.body;
            const userId = req.user?.id;

            const uploadedFiles = files.map((file: any) => ({
                buffer: file.buffer,
                originalName: file.originalname,
                mimeType: file.mimetype,
            }));

            // Determinar pasta
            const folderPath = uploadedFiles.some((f) => f.mimeType.startsWith('video/'))
                ? 'videos'
                : 'images';

            const medias = await mediaService.uploadMultiple(
                uploadedFiles,
                userId,
                occurrenceId,
                folderPath
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: `✅ ${medias.length} arquivo(s) enviado(s) com sucesso!`,
                dados: medias,
            });
        } catch (error) {
            console.error('Erro no upload múltiplo:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao fazer upload dos arquivos.',
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    }

    /**
     * Download de arquivo
     */
    public async download(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            const media = await mediaService.getById(id);
            if (!media) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: '❌ Arquivo não encontrado.',
                });
            }

            // Download do GCS
            const downloadResult = await CloudStorageService.downloadFile(media.filePath);

            res.setHeader('Content-Type', downloadResult.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${downloadResult.fileName}"`);
            res.setHeader('Content-Length', downloadResult.buffer.length);

            return res.send(downloadResult.buffer);
        } catch (error) {
            console.error('Erro no download:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao fazer download do arquivo.',
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    }

    /**
     * Obtém URL assinada para download/visualização
     */
    public async getSignedUrl(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { expiresIn } = req.query;

            const expiresInMs = expiresIn ? parseInt(expiresIn as string) : 7 * 24 * 60 * 60 * 1000;

            const signedUrl = await mediaService.getSignedUrl(id, expiresInMs);

            return res.status(200).json({
                sucesso: true,
                mensagem: '✅ URL assinada gerada com sucesso!',
                dados: {
                    url: signedUrl,
                    expiresIn: expiresInMs,
                },
            });
        } catch (error) {
            console.error('Erro ao gerar URL assinada:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao gerar URL assinada.',
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    }

    /**
     * Lista todos os arquivos
     */
    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const mediaList = await mediaService.getAll();
            return res.status(200).json({
                sucesso: true,
                dados: mediaList,
            });
        } catch (error) {
            console.error('Erro ao listar arquivos:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao buscar arquivos.',
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    }

    /**
     * Obtém arquivo por ID
     */
    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const media = await mediaService.getById(id);
            if (!media) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: '❌ Arquivo não encontrado.',
                });
            }

            return res.status(200).json({
                sucesso: true,
                dados: media,
            });
        } catch (error) {
            console.error('Erro ao buscar arquivo:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao buscar arquivo.',
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    }

    /**
     * Obtém arquivos de uma ocorrência
     */
    public async getByOccurrenceId(req: Request, res: Response): Promise<Response> {
        try {
            const { occurrenceId } = req.params;

            const medias = await mediaService.getByOccurrenceId(occurrenceId);

            return res.status(200).json({
                sucesso: true,
                dados: medias,
            });
        } catch (error) {
            console.error('Erro ao listar arquivos da ocorrência:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao buscar arquivos da ocorrência.',
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    }

    /**
     * Deleta um arquivo
     */
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            await mediaService.delete(id);

            return res.status(200).json({
                sucesso: true,
                mensagem: '✅ Arquivo deletado com sucesso!',
            });
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao deletar arquivo.',
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    }

    /**
     * Deleta múltiplos arquivos
     */
    public async deleteMultiple(req: Request, res: Response): Promise<Response> {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ IDs de arquivos não fornecidos.',
                });
            }

            await mediaService.deleteMultiple(ids);

            return res.status(200).json({
                sucesso: true,
                mensagem: `✅ ${ids.length} arquivo(s) deletado(s) com sucesso!`,
            });
        } catch (error) {
            console.error('Erro ao deletar múltiplos arquivos:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao deletar arquivos.',
                erro: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    }
}