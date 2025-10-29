import Occurrence from '../Models/Occurrence.js';
import type { OccurrenceCreatePayload } from '../Interfaces/OccurrenceInterfaces.js';
import mongoose from 'mongoose';

export const OccurrenceService = {
  criar: async (dados: OccurrenceCreatePayload, criadoPor: mongoose.Types.ObjectId) => {
    const novaOcorrencia = new Occurrence({
      ...dados,
      criadoPor,
      statusGeral: 'em andamento',
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
    const ocorrencia = await Occurrence.findById(id);
    if (!ocorrencia) return null;

    if (ocorrencia.statusGeral !== 'em andamento') {
      throw new Error('Ocorrência não pode ser editada pois não está em andamento');
    }

    Object.assign(ocorrencia, dados, { updatedAt: new Date() });
    return await ocorrencia.save();
  },

  cancelar: async (id: string) => {
    const ocorrencia = await Occurrence.findById(id);
    if (!ocorrencia) return null;

    ocorrencia.statusGeral = 'cancelada';
    ocorrencia.canceladoEm = new Date();
    return await ocorrencia.save();
  },

  finalizar: async (id: string) => {
    const ocorrencia = await Occurrence.findById(id);
    if (!ocorrencia) return null;

    if (ocorrencia.statusGeral !== 'em andamento') {
      throw new Error('Ocorrência já está finalizada ou cancelada');
    }

    ocorrencia.statusGeral = 'finalizada';
    ocorrencia.updatedAt = new Date();
    return await ocorrencia.save();
  }
};