import { Request, Response } from 'express';
import { MediaModel } from '../Models/Media.js';
import mongoose from 'mongoose';

interface PhotoMetadata {
  fileUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export class MediaRegistrationController {
  /**
   * Registra fotos já enviadas ao Cloudinary
   * POST /api/media/register
   */
  public async registerPhotos(req: Request, res: Response): Promise<Response> {
    try {
      const { occurrenceId, photos } = req.body as {
        occurrenceId: string;
        photos: PhotoMetadata[];
      };
      const userId = req.user?.id;

      console.log('📝 Registrando fotos no banco...');
      console.log('OccurrenceId:', occurrenceId);
      console.log('Quantidade de fotos:', photos?.length);

      // Validações
      if (!occurrenceId) {
        return res.status(400).json({
          sucesso: false,
          mensagem: '❌ occurrenceId é obrigatório',
        });
      }

      if (!photos || !Array.isArray(photos) || photos.length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: '❌ photos deve ser um array não vazio',
        });
      }

      // Validar cada foto
      for (const photo of photos) {
        if (!photo.fileUrl || !photo.publicId || !photo.bytes) {
          return res.status(400).json({
            sucesso: false,
            mensagem: '❌ Cada foto deve ter fileUrl, publicId e bytes',
          });
        }
      }

      // Salvar fotos no banco
      const savedPhotos = [];

      for (const photo of photos) {
        const fileType = photo.format?.toLowerCase();
        const isVideo = ['mp4', 'mov', 'avi'].includes(fileType || '');

        const media = new MediaModel({
          occurrenceId: new mongoose.Types.ObjectId(occurrenceId),
          name: photo.publicId.split('/').pop() || 'photo',
          fileType: isVideo ? 'video' : 'image',
          filePath: photo.fileUrl,
          fileUrl: photo.fileUrl,
          size: photo.bytes,
          mimeType: `${isVideo ? 'video' : 'image'}/${photo.format || 'jpeg'}`,
          uploaded: true,
          cloudStorage: true,
          uploadedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          metadata: {
            cloudinaryPublicId: photo.publicId,
            width: photo.width,
            height: photo.height,
          },
        });

        await media.save();
        savedPhotos.push({
          _id: media._id,
          name: media.name,
          fileType: media.fileType,
          fileUrl: media.fileUrl,
          size: media.size,
        });

        console.log('✅ Foto registrada:', media._id);
      }

      return res.status(201).json({
        sucesso: true,
        mensagem: `✅ ${savedPhotos.length} foto(s) registrada(s) com sucesso!`,
        dados: savedPhotos,
      });
    } catch (error) {
      console.error('❌ Erro ao registrar fotos:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(500).json({
        sucesso: false,
        mensagem: `❌ Erro ao registrar fotos: ${message}`,
      });
    }
  }

  /**
   * Registra foto única já enviada ao Cloudinary
   * POST /api/media/register-single
   */
  public async registerSinglePhoto(req: Request, res: Response): Promise<Response> {
    try {
      const { occurrenceId, photo } = req.body as {
        occurrenceId: string;
        photo: PhotoMetadata;
      };

      // Converte para array e usa a função principal
      return this.registerPhotos(
        { ...req, body: { occurrenceId, photos: [photo] } } as Request,
        res
      );
    } catch (error) {
      console.error('❌ Erro ao registrar foto única:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(500).json({
        sucesso: false,
        mensagem: `❌ Erro ao registrar foto: ${message}`,
      });
    }
  }
}

export default new MediaRegistrationController();
