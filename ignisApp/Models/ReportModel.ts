import { Schema, model, Document } from 'mongoose';

export interface IReport extends Document {
  generatedAt: Date;
  format: string;
  user: string; // ID do usuário que gerou o relatório
  occurrences: string[]; // IDs das ocorrências incluídas no relatório
}

const ReportSchema = new Schema<IReport>({
  generatedAt: { type: Date, default: Date.now },
  format: { type: String, required: true },
  user: { type: String, required: true },
  occurrences: [{ type: String, required: true }]
});

export const ReportModel = model<IReport>('Report', ReportSchema);