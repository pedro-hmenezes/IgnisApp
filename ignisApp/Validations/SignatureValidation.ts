import { z } from 'zod';

export const signatureSchema = z.object({
    occurrenceId: z
        .string()
        .min(1, 'ID da ocorrência é obrigatório')
        .regex(/^[0-9a-f]{24}$/i, 'ID da ocorrência é inválido'),
    signerName: z
        .string()
        .min(3, 'Nome do assinante deve ter no mínimo 3 caracteres')
        .max(100, 'Nome do assinante não pode exceder 100 caracteres')
        .regex(/^[a-záàâãéèêíïóôõöúçñ\s'-]+$/i, 'Nome contém caracteres inválidos'),
    signatureData: z
        .string()
        .min(50, 'Dados de assinatura inválidos')
        .refine(
            (val) =>
                val.startsWith('data:image') ||
                val.startsWith('http://') ||
                val.startsWith('https://'),
            'Assinatura deve ser base64 ou URL válida'
        ),
    signerRole: z
        .string()
        .max(50, 'Função não pode exceder 50 caracteres')
        .optional(),
    screenResolution: z
        .string()
        .optional(),
});

export type SignatureInput = z.infer<typeof signatureSchema>;
