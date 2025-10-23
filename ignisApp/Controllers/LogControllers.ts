import type { Request, Response } from 'express';
import { LogModel } from '../Models/Log';

export const getLogs = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, action, user } = req.query;

        const filters: any = {};

        if (startDate || endDate) {
            filters.dateTime = {};
            if (startDate) filters.dateTime.$gte = new Date(startDate as string);
            if (endDate) filters.dateTime.$lte = new Date(endDate as string);
        }

        if (action) filters.action = { $regex: new RegExp(action as string, 'i') };
        if (user) filters.user = user;

        const logs = await LogModel.find(filters).sort({ dateTime: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar logs', error });
    }
};