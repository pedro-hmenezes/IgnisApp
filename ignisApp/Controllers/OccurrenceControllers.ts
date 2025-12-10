import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { occurrenceCreateSchema } from '../Validations/OccurrenceValidation.js';
import { OccurrenceService } from '../Services/OccurrenceService.js';
import { OccurrenceCreatePayload } from '../Interfaces/OccurrenceInterfaces';

export const createOccurrence = async (req: Request, res: Response) => {
  const parsed = occurrenceCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    const formattedErrors = parsed.error.issues.map((issue) => ({
      campo: issue.path.join('.'),
      mensagem: issue.message,
    }));

    return res.status(400).json({
      sucesso: false,
      mensagem: 'Verifique os campos obrigatórios',
      detalhes: formattedErrors,
    });
  }

  if (!req.user?.id) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Usuário não autenticado'
    });
  }

  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const payload: OccurrenceCreatePayload = {
      ...parsed.data,
      timestampRecebimento: new Date(parsed.data.timestampRecebimento),
    };

    const saved = await OccurrenceService.criar(payload, userId);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Ocorrência criada com sucesso!',
      dados: saved,
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar ocorrência',
      error
    });
  }
}; export const getOccurrences = async (req: Request, res: Response) => {
  try {
    const occurrences = await OccurrenceService.listar();
    return res.status(200).json(occurrences);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar ocorrências', error });
  }
};

export const getOccurrenceById = async (req: Request, res: Response) => {
  try {
    const occurrence = await OccurrenceService.buscarPorId(req.params.id);
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
    const updated = await OccurrenceService.atualizar(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Ocorrência não encontrada ou não pode ser editada' });
    }
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar ocorrência', error });
  }
};

export const cancelOccurrence = async (req: Request, res: Response) => {
  try {
    const canceled = await OccurrenceService.cancelar(req.params.id);
    if (!canceled) {
      return res.status(404).json({ message: 'Ocorrência não encontrada' });
    }
    return res.status(200).json(canceled);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao cancelar ocorrência', error });
  }
};

export const finalizeOccurrence = async (req: Request, res: Response) => {
  try {
    const finalized = await OccurrenceService.finalizar(req.params.id);
    if (!finalized) {
      return res.status(404).json({ message: 'Ocorrência não encontrada ou já finalizada/cancelada' });
    }
    return res.status(200).json(finalized);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao finalizar ocorrência', error });
  }
};