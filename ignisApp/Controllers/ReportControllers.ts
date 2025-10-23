import type { Request, Response } from 'express';
import { ReportModel } from '../Models/ReportModel';
import { registerLog } from '../Services/LogService';

export const createReport = async (req: Request, res: Response) => {
    try {
        const { title, description, userId } = req.body;

        const newReport = new ReportModel({ title, description, createdBy: userId });
        await newReport.save();

        // Registro do log
        await registerLog('Criação de relatório', `Relatório "${title}" criado com sucesso.`, userId);

        res.status(201).json(newReport);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar relatório', error });
    }
};
