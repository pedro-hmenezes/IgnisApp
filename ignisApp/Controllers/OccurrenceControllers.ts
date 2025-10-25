import type { Request, Response } from 'express';
import Occurrence from '../Models/Occurrence';
import { occurrenceCreateSchema } from '../Validations/OccurrenceValidation';
import type { OccurrenceCreatePayload } from '../Interfaces/OccurrenceInterfaces'

export const createOccurrence = async (req: Request, res: Response) => {
  const parsed = occurrenceCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Dados inválidos',
      issues: parsed.error.issues, // Corrigido: 'issues' em vez de 'errors'
    });
  }

  try {
    const occurrence = new Occurrence({
      ...parsed.data,
      criadoPor: req.user?.id, // Tipado corretamente via types.d.ts
      statusGeral: 'Recebida',
    });

    const saved = await occurrence.save();
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar ocorrência', error });
  }
};

export const getOccurrences = async (req: Request, res: Response) => {
  try {
    const occurrences = await Occurrence.find().select('_id naturezaInicial statusGeral timestampRecebimento endereco');
    return res.status(200).json(occurrences);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar ocorrências', error });
  }
};

export const getOccurrenceById = async (req: Request, res: Response) => {
  try {
    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      return res.status(404).json({ message: 'Ocorrência não encontrada' });
    }
    return res.status(200).json(occurrence);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar ocorrência', error });
  }
};

export const updateOccurrence = async (req: Request, res: Response) => {
  try {
    const updated = await Occurrence.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Ocorrência não encontrada' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar ocorrência', error });
  }
};

export const cancelOccurrence = async (req: Request, res: Response) => {
  try {
    const canceled = await Occurrence.findByIdAndUpdate(
      req.params.id,
      { statusGeral: 'Cancelada', updatedAt: new Date() },
      { new: true }
    );

    if (!canceled) {
      return res.status(404).json({ message: 'Ocorrência não encontrada' });
    }

    return res.status(200).json(canceled);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao cancelar ocorrência', error });
  }
};