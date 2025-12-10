import { z } from 'zod';

const numberWithFriendlyMessage = (message: string) => z.number({ message });

export const occurrenceCreateSchema = z.object({
  numAviso: z.string().min(1, 'Número do aviso é obrigatório'),
  tipoOcorrencia: z.string().min(1, 'Tipo de ocorrência é obrigatório'),
  timestampRecebimento: z.string().datetime('Data/hora deve estar em formato válido').transform((val) => new Date(val)),
  formaAcionamento: z.string().min(1, 'Forma de acionamento é obrigatória'),
  situacaoOcorrencia: z.string().min(1, 'Situação da ocorrência é obrigatória'),
  naturezaInicial: z.string().min(1, 'Natureza inicial é obrigatória'),
  latitude: numberWithFriendlyMessage(
    'Latitude é obrigatória e deve ser um número válido (localização GPS)',
  ).refine((val) => val >= -90 && val <= 90, 'Latitude deve estar entre -90 e 90'),
  longitude: numberWithFriendlyMessage(
    'Longitude é obrigatória e deve ser um número válido (localização GPS)',
  ).refine((val) => val >= -180 && val <= 180, 'Longitude deve estar entre -180 e 180'),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    municipio: z.string().min(1, 'Município é obrigatório'),
    referencia: z.string().optional(),
  }),
  solicitante: z.object({
    nome: z.string().min(1, 'Nome do solicitante é obrigatório'),
    telefone: z.string().regex(/^\d+$/, 'Telefone deve conter apenas dígitos').min(1, 'Telefone é obrigatório'),
    relacao: z.string().min(1, 'Relação com o afetado é obrigatória'),
  }),
});