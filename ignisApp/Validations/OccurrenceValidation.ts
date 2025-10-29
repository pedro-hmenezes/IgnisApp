import { z } from 'zod';

export const occurrenceCreateSchema = z.object({
  numAviso: z.string().min(1),
  tipoOcorrencia: z.string().min(1),
  timestampRecebimento: z.string().datetime().transform((val) => new Date(val)),
  formaAcionamento: z.string().min(1),
  situacaoOcorrencia: z.string().min(1),
  naturezaInicial: z.string().min(1),
  endereco: z.object({
    rua: z.string(),
    numero: z.string(),
    bairro: z.string(),
    municipio: z.string(),
    referencia: z.string().optional(),
  }),
  solicitante: z.object({
    nome: z.string(),
    telefone: z.string().regex(/^\d+$/, 'Telefone deve conter apenas dígitos'),
    relacao: z.string(),
  }),
});
