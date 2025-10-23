import { Schema, model, Document } from 'mongoose';

export interface ILog extends Document {
    dateTime: Date;
    action: string;
    details: string;
    user?: string; // opcional, se quiser registrar o usuário
}

const LogSchema = new Schema<ILog>({
    dateTime: { type: Date, default: Date.now },
    action: { type: String, required: true },
    details: { type: String, required: true },
    user: { type: String } // pode ser o ID ou email do usuário
});

export const LogModel = model<ILog>('Log', LogSchema);
