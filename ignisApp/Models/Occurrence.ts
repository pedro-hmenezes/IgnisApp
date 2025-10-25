import mongoose, { Schema, Document } from 'mongoose';

export interface IOccurrence extends Document {
  numAviso: string;
  tipoOcorrencia: string;
  timestampRecebimento: Date;
  formaAcionamento: string;
  situacaoOcorrencia: string;
  naturezaInicial: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    municipio: string;
    referencia?: string;
  };
  solicitante: {
    nome: string;
    telefone: string;
    relacao: string;
  };
  criadoPor: mongoose.Types.ObjectId;
  statusGeral: string;
  createdAt: Date;
  updatedAt: Date;
}

const OccurrenceSchema = new Schema<IOccurrence>(
  {
    numAviso: { type: String, required: true },
    tipoOcorrencia: { type: String, required: true },
    timestampRecebimento: { type: Date, required: true },
    formaAcionamento: { type: String, required: true },
    situacaoOcorrencia: { type: String, required: true },
    naturezaInicial: { type: String, required: true },
    endereco: {
      rua: { type: String, required: true },
      numero: { type: String, required: true },
      bairro: { type: String, required: true },
      municipio: { type: String, required: true },
      referencia: { type: String },
    },
    solicitante: {
      nome: { type: String, required: true },
      telefone: { type: String, required: true },
      relacao: { type: String, required: true },
    },
    criadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    statusGeral: { type: String, default: 'Recebida' },
  },
  { timestamps: true }
);

export default mongoose.model<IOccurrence>('Occurrence', OccurrenceSchema);