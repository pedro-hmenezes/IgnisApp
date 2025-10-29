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

export interface IOccurrence {
  numAviso: string;
  tipoOcorrencia: string;
  timestampRecebimento: Date;
  formaAcionamento: string;
  situacaoOcorrencia: string;
  naturezaInicial: string;
  endereco: IEndereco;
  solicitante: ISolicitante;
  criadoPor: Types.ObjectId;
  statusGeral: 'em andamento' | 'finalizada' | 'cancelada';
  canceladoEm?: Date;
  motivoCancelamento?: string;
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