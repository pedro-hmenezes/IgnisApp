export interface OccurrenceCreatePayload {
  numAviso: string;
  tipoOcorrencia: string;
  timestampRecebimento: string;
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
  criadoPor?: string;
}