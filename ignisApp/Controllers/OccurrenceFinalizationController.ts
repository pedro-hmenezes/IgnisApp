import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import OccurrenceFinalizationService from '../Services/OccurrenceFinalizationService.js';

export class OccurrenceFinalizationController {
    /**
     * Finaliza ocorrência completamente (Relatório + GPS + Assinatura)
     * Endpoint consolidado para o mobile
     * 
     * PATCH /api/occurrences/:id/finalize
     */
    public async finalizeComplete(req: Request, res: Response): Promise<Response> {
        try {
            const { id: occurrenceId } = req.params;
            const userId = req.user?.id;

            console.log('=== REQUISIÇÃO DE FINALIZAÇÃO RECEBIDA ===');
            console.log('OccurrenceId:', occurrenceId);
            console.log('UserId:', userId);
            console.log('Body:', JSON.stringify(req.body, null, 2));

            if (!userId) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: '❌ Usuário não autenticado',
                });
            }

            // Extrair dados do body
            const {
                viaturaEmpenhada,
                equipe,
                descricaoAcoes,
                latitudeFinal,
                longitudeFinal,
                signerName,
                signerRole,
                signatureData,
                photosIds,
            } = req.body;

            // Validações básicas
            if (!viaturaEmpenhada || !equipe || !descricaoAcoes) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ Campos obrigatórios do relatório: viaturaEmpenhada, equipe, descricaoAcoes',
                    camposFaltantes: [
                        !viaturaEmpenhada ? 'viaturaEmpenhada' : null,
                        !equipe ? 'equipe' : null,
                        !descricaoAcoes ? 'descricaoAcoes' : null,
                    ].filter(Boolean),
                });
            }

            if (!latitudeFinal || !longitudeFinal) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ Localização GPS final é obrigatória',
                    camposFaltantes: ['latitudeFinal', 'longitudeFinal'],
                });
            }

            if (!signerName || !signatureData) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ Assinatura incompleta: signerName e signatureData são obrigatórios',
                    camposFaltantes: [
                        !signerName ? 'signerName' : null,
                        !signatureData ? 'signatureData' : null,
                    ].filter(Boolean),
                });
            }

            // Validar formato da assinatura (Base64)
            if (!this.isValidSignatureData(signatureData)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ Formato de assinatura inválido (deve ser base64)',
                });
            }

            // Processar finalização completa
            const result = await OccurrenceFinalizationService.finalizeOccurrence(
                occurrenceId,
                new mongoose.Types.ObjectId(userId),
                {
                    viaturaEmpenhada,
                    equipe,
                    descricaoAcoes,
                    latitudeFinal: parseFloat(latitudeFinal),
                    longitudeFinal: parseFloat(longitudeFinal),
                    signerName,
                    signerRole: signerRole || 'Responsável',
                    signatureData,
                    photosIds: photosIds || [],
                },
                this.getClientIp(req),
                req.headers['user-agent']
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: '✅ Ocorrência finalizada com sucesso!',
                dados: result,
            });

        } catch (error) {
            console.error('❌ Erro ao finalizar ocorrência:', error);
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            
            return res.status(500).json({
                sucesso: false,
                mensagem: `❌ Erro ao finalizar: ${message}`,
            });
        }
    }

    /**
     * Busca detalhes completos de uma ocorrência finalizada
     * GET /api/occurrences/:id/finalization-details
     */
    public async getFinalizationDetails(req: Request, res: Response): Promise<Response> {
        try {
            const { id: occurrenceId } = req.params;

            const details = await OccurrenceFinalizationService.getFinalizedOccurrenceDetails(occurrenceId);

            return res.status(200).json({
                sucesso: true,
                dados: details,
            });

        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            
            return res.status(500).json({
                sucesso: false,
                mensagem: `❌ Erro ao buscar detalhes: ${message}`,
            });
        }
    }

    /**
     * Valida se os dados da assinatura estão no formato correto
     */
    private isValidSignatureData(signatureData: string): boolean {
        if (!signatureData) return false;

        // Validar se é base64 de imagem
        const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
        return base64Regex.test(signatureData);
    }

    /**
     * Obtém IP do cliente
     */
    private getClientIp(req: Request): string {
        return (
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.socket.remoteAddress ||
            'unknown'
        );
    }
}

export default new OccurrenceFinalizationController();
