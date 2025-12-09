import mongoose, { Schema, Document } from 'mongoose';
import { IOccurrence } from '../Interfaces/OccurrenceInterfaces';

const EnderecoSchema = new Schema(
  {
    rua: { type: String, required: true },
    numero: { type: String, required: true },
    bairro: { type: String, required: true },
    municipio: { type: String, required: true },
    referencia: { type: String },
  },
  { _id: false }
);

const SolicitanteSchema = new Schema(
  {
    nome: { type: String, required: true },
    telefone: { type: String, required: true },
    relacao: { type: String, required: true },
  },
  { _id: false }
);

const OccurrenceSchema = new Schema<IOccurrence & Document>(
  {
    numAviso: { type: String, required: true },
    tipoOcorrencia: { type: String, required: true },
    timestampRecebimento: { type: Date, required: true },
    formaAcionamento: { type: String, required: true },
    situacaoOcorrencia: { type: String, required: true },
    naturezaInicial: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    endereco: { type: EnderecoSchema, required: true },
    solicitante: { type: SolicitanteSchema, required: true },
    criadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    finalizadoPor: { type: Schema.Types.ObjectId, ref: 'User' },
    finalizadoEm: { type: Date },
    statusGeral: {
      type: String,
      enum: ['em andamento', 'finalizada', 'cancelada'],
      default: 'em andamento',
      required: true,
    },
    canceladoEm: { type: Date },
    motivoCancelamento: { type: String },
    signature: {
      type: Schema.Types.ObjectId,
      ref: 'Signature',
    },
    // Campos do Relatório Operacional (preenchidos no mobile)
    viaturaEmpenhada: { type: String },
    equipe: { type: String },
    descricaoAcoes: { type: String },
    // Localização GPS final (capturada no mobile)
    latitudeFinal: { type: Number },
    longitudeFinal: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<IOccurrence & Document>('Occurrence', OccurrenceSchema);