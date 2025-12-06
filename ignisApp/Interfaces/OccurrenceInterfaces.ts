import { Types } from 'mongoose';

export interface IEndereco {
  rua: string;
  numero: string;
  bairro: string;
  municipio: string;
  referencia?: string;
}

export interface ISolicitante {
  nome: string;
  telefone: string;
  relacao: string;
}

export interface ISignature {
  occurrenceId: Types.ObjectId;
  signerName: string;
  signerRole?: string;
  signatureData: string;
  signedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    platform?: string;
    screenResolution?: string;
    timestamp?: Date;
  };
}

export interface IOccurrence {
  numAviso: string;
  tipoOcorrencia: string;
  timestampRecebimento: Date;
  formaAcionamento: string;
  situacaoOcorrencia: string;
  naturezaInicial: string;
  latitude: number;
  longitude: number;
  endereco: IEndereco;
  solicitante: ISolicitante;
  criadoPor: Types.ObjectId;
  statusGeral: 'em andamento' | 'finalizada' | 'cancelada';
  canceladoEm?: Date;
  motivoCancelamento?: string;
  finalizadoPor?: Types.ObjectId;
  finalizadoEm?: Date;
  signature?: Types.ObjectId | ISignature;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OccurrenceCreatePayload {
  numAviso: string;
  tipoOcorrencia: string;
  timestampRecebimento: Date;
  formaAcionamento: string;
  situacaoOcorrencia: string;
  naturezaInicial: string;
  endereco: IEndereco;
  solicitante: ISolicitante;
}