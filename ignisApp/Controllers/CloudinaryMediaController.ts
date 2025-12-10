import { Request, Response } from 'express';
import { MediaModel } from '../Models/Media.js';
import mongoose from 'mongoose';

export class CloudinaryMediaController {
  /**
   * Upload de arquivo único para Cloudinary
   * POST /api/media/cloudinary/upload
   */
  public async uploadSingle(req: Request, res: Response): Promise<Response> {
    try {
      console.log('Iniciando upload único...');
      console.log('Headers:', req.headers);
      console.log('Body occurrenceId:', req.body.occurrenceId);
      
      const file = req.file;
      const { occurrenceId } = req.body;

      if (!file) {
        console.log('Nenhum arquivo recebido');
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nenhum arquivo foi enviado',
        });
      }

      console.log('Arquivo recebido:');
      console.log('- Nome:', file.originalname);
      console.log('- Tamanho:', file.size);
      console.log('- Tipo:', file.mimetype);
      console.log('Upload para Cloudinary concluído:', file.filename);

      // Extrair informações do Cloudinary
      const cloudinaryFile = file as Express.Multer.File & {
        path: string;
        filename: string;
      };

      // Determinar tipo de arquivo
      const fileType = file.mimetype.startsWith('video/') 
        ? 'video' 
        : file.mimetype.startsWith('image/') 
          ? 'image' 
          : 'unknown';

      // Criar registro no banco
      const media = new MediaModel({
        occurrenceId: occurrenceId ? new mongoose.Types.ObjectId(occurrenceId) : undefined,
        name: file.originalname,
        fileType: fileType,
        filePath: cloudinaryFile.path, // URL do Cloudinary
        fileUrl: cloudinaryFile.path,  // URL pública
        size: file.size,
        mimeType: file.mimetype,
        uploaded: true,
        cloudStorage: true,
        uploadedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
        metadata: {
          cloudinaryPublicId: cloudinaryFile.filename,
        },
      });

      await media.save();

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Arquivo enviado com sucesso!',
        dados: {
          _id: media._id,
          name: media.name,
          fileType: media.fileType,
          fileUrl: media.fileUrl,
          size: media.size,
          uploaded: true,
        },
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao fazer upload do arquivo',
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Upload de múltiplos arquivos para Cloudinary
   * POST /api/media/cloudinary/upload-multiple
   */
  public async uploadMultiple(req: Request, res: Response): Promise<Response> {
    try {
      const files = req.files as Express.Multer.File[];
      const { occurrenceId } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nenhum arquivo foi enviado',
        });
      }

      console.log(`${files.length} arquivo(s) enviado(s) para Cloudinary`);

      const uploadedMedia = [];

      for (const file of files) {
        const cloudinaryFile = file as Express.Multer.File & {
          path: string;
          filename: string;
        };

        const fileType = file.mimetype.startsWith('video/') 
          ? 'video' 
          : file.mimetype.startsWith('image/') 
            ? 'image' 
            : 'unknown';

        const media = new MediaModel({
          occurrenceId: occurrenceId ? new mongoose.Types.ObjectId(occurrenceId) : undefined,
          name: file.originalname,
          fileType: fileType,
          filePath: cloudinaryFile.path,
          fileUrl: cloudinaryFile.path,
          size: file.size,
          mimeType: file.mimetype,
          uploaded: true,
          cloudStorage: true,
          uploadedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
          metadata: {
            cloudinaryPublicId: cloudinaryFile.filename,
          },
        });

        await media.save();
        uploadedMedia.push({
          _id: media._id,
          name: media.name,
          fileType: media.fileType,
          fileUrl: media.fileUrl,
          size: media.size,
        });
      }

      return res.status(201).json({
        sucesso: true,
        mensagem: `${uploadedMedia.length} arquivo(s) enviado(s) com sucesso!`,
        dados: uploadedMedia,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao fazer upload dos arquivos',
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Deletar arquivo do Cloudinary e do banco
   * DELETE /api/media/cloudinary/:id
   */
  public async deleteMedia(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const media = await MediaModel.findById(id);
      
      if (!media) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Arquivo não encontrado',
        });
      }

      // Deletar do Cloudinary
      if (media.metadata?.cloudinaryPublicId) {
        const cloudinary = (await import('../Config/cloudinary.js')).default;
        await cloudinary.uploader.destroy(media.metadata.cloudinaryPublicId);
        console.log('Arquivo deletado do Cloudinary');
      }

      // Deletar do banco
      await MediaModel.findByIdAndDelete(id);

      return res.json({
        sucesso: true,
        mensagem: 'Arquivo deletado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao deletar arquivo',
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}

export default new CloudinaryMediaController();
