// Services/OccurrenceService.ts
import Occurrence from '../Models/Occurrence.js';
import type { OccurrenceCreatePayload } from '../Interfaces/OccurrenceInterfaces.js';
import mongoose from 'mongoose';

export const OccurrenceService = {
  criar: async (dados: OccurrenceCreatePayload, criadoPor: mongoose.Types.ObjectId) => {
    const novaOcorrencia = new Occurrence({
      ...dados,
      criadoPor,
      statusGeral: 'Recebida',
    });
    return await novaOcorrencia.save();
  },

  listar: async () => {
    return await Occurrence.find().select('_id naturezaInicial statusGeral timestampRecebimento endereco');
  },

  buscarPorId: async (id: string) => {
    return await Occurrence.findById(id);
  },

  atualizar: async (id: string, dados: Partial<OccurrenceCreatePayload>) => {
    return await Occurrence.findByIdAndUpdate(
      id,
      { ...dados, updatedAt: new Date() },
      { new: true }
    );
  },

  cancelar: async (id: string) => {
    return await Occurrence.findByIdAndUpdate(
      id,
      { statusGeral: 'Cancelada', updatedAt: new Date() },
      { new: true }
    );
  }
};