import type { Request, Response } from 'express';
import { MediaService } from '../Services/MediaService';

const mediaService = new MediaService();

export class MediaController {
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const { name, fileType, filePath, size, mimeType } = req.body;

            const media = await mediaService.create({
                name,
                fileType: fileType ?? 'desconhecido',
                filePath,
                size,
                mimeType,
                uploaded: true
            });

            return res.status(201).json(media);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar mídia.' });
        }
    }

    public async upload(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            }

            const { originalname, mimetype, size, path } = req.file;

            const media = await mediaService.create({
                name: originalname,
                fileType: mimetype?.split('/')[0] ?? 'desconhecido',
                filePath: path,
                size,
                mimeType: mimetype,
                uploaded: true
            });

            return res.status(201).json({ message: 'Upload realizado com sucesso.', media });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao fazer upload da mídia.' });
        }
    }

    public async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const mediaList = await mediaService.getAll();
            return res.status(200).json(mediaList);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar mídias.' });
        }
    }

    public async getById(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ error: 'ID não fornecido.' });

            const media = await mediaService.getById(id);
            if (media) {
                return res.status(200).json(media);
            } else {
                return res.status(404).json({ error: 'Mídia não encontrada.' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar mídia.' });
        }
    }

    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ error: 'ID não fornecido.' });

            const updatedMedia = await mediaService.update(id, req.body);
            return res.status(200).json(updatedMedia);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar mídia.' });
        }
    }

    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ error: 'ID não fornecido.' });

            await mediaService.delete(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar mídia.' });
        }
    }
}