import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import SignatureService from '../Services/SignatureService.js';

export class SignatureController {
    /**
     * Salva assinatura e finaliza ocorrência
     */
    public async signOccurrence(req: Request, res: Response): Promise<Response> {
        try {
            const { occurrenceId, signerName, signatureData, signerRole } = req.body;
            const userId = req.user?.id;

            console.log('=== INICIANDO PROCESSO DE ASSINATURA ===');
            console.log('OccurrenceId recebido:', occurrenceId);
            console.log('SignerName:', signerName);
            console.log('UserId:', userId);

            // Validações
            if (!occurrenceId || !signerName || !signatureData) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        '❌ Campos obrigatórios: occurrenceId, signerName, signatureData',
                    campos: ['occurrenceId', 'signerName', 'signatureData'],
                });
            }

            if (!userId) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: '❌ Usuário não autenticado',
                });
            }

            // Validar dados da assinatura
            if (!SignatureService.validateSignatureData(signatureData)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        '❌ Dados de assinatura inválidos (deve ser base64 ou URL válida)',
                });
            }

            // Extrair informações do dispositivo
            const deviceInfo = {
                platform: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
                screenResolution: req.body.screenResolution,
                timestamp: new Date(),
            };

            // Salvar assinatura
            const result = await SignatureService.saveSignature(
                occurrenceId,
                signerName,
                signatureData,
                new mongoose.Types.ObjectId(userId),
                signerRole,
                deviceInfo,
                this.getClientIp(req),
                req.headers['user-agent']
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: '✅ Assinatura registrada com sucesso!',
                dados: {
                    signature: {
                        _id: result.signature._id,
                        signerName: result.signature.signerName,
                        signerRole: result.signature.signerRole,
                        signedAt: result.signature.signedAt,
                        occurrence: result.occurrence,
                    },
                },
            });
        } catch (error) {
            console.error('Erro ao assinar ocorrência:', error);
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            return res.status(500).json({
                sucesso: false,
                mensagem: `❌ Erro ao registrar assinatura: ${message}`,
            });
        }
    }

    /**
     * Obtém assinatura de uma ocorrência
     */
    public async getSignatureByOccurrence(req: Request, res: Response): Promise<Response> {
        try {
            const { occurrenceId } = req.params;

            if (!occurrenceId) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ ID da ocorrência é obrigatório',
                });
            }

            const signature = await SignatureService.getSignatureByOccurrence(occurrenceId);

            if (!signature) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: '❌ Assinatura não encontrada para esta ocorrência',
                });
            }

            return res.status(200).json({
                sucesso: true,
                dados: signature,
            });
        } catch (error) {
            console.error('Erro ao buscar assinatura:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao buscar assinatura',
            });
        }
    }

    /**
     * Obtém assinatura por ID
     */
    public async getSignatureById(req: Request, res: Response): Promise<Response> {
        try {
            const { signatureId } = req.params;

            if (!signatureId) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ ID da assinatura é obrigatório',
                });
            }

            const signature = await SignatureService.getSignatureById(signatureId);

            if (!signature) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: '❌ Assinatura não encontrada',
                });
            }

            return res.status(200).json({
                sucesso: true,
                dados: signature,
            });
        } catch (error) {
            console.error('Erro ao buscar assinatura:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao buscar assinatura',
            });
        }
    }

    /**
     * Lista assinaturas do usuário
     */
    public async getUserSignatures(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: '❌ Usuário não autenticado',
                });
            }

            const signatures = await SignatureService.getSignaturesByUser(userId);

            return res.status(200).json({
                sucesso: true,
                total: signatures.length,
                dados: signatures,
            });
        } catch (error) {
            console.error('Erro ao listar assinaturas:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao listar assinaturas',
            });
        }
    }

    /**
     * Atualiza assinatura (apenas certos campos)
     */
    public async updateSignature(req: Request, res: Response): Promise<Response> {
        try {
            const { signatureId } = req.params;
            const { signerRole } = req.body;

            if (!signatureId) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ ID da assinatura é obrigatório',
                });
            }

            const signature = await SignatureService.updateSignature(signatureId, {
                signerRole,
            });

            if (!signature) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: '❌ Assinatura não encontrada',
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: '✅ Assinatura atualizada com sucesso!',
                dados: signature,
            });
        } catch (error) {
            console.error('Erro ao atualizar assinatura:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao atualizar assinatura',
            });
        }
    }

    /**
     * Deleta assinatura
     */
    public async deleteSignature(req: Request, res: Response): Promise<Response> {
        try {
            const { signatureId } = req.params;

            if (!signatureId) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: '❌ ID da assinatura é obrigatório',
                });
            }

            await SignatureService.deleteSignature(signatureId);

            return res.status(200).json({
                sucesso: true,
                mensagem: '✅ Assinatura deletada com sucesso!',
            });
        } catch (error) {
            console.error('Erro ao deletar assinatura:', error);
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            return res.status(500).json({
                sucesso: false,
                mensagem: `❌ Erro ao deletar assinatura: ${message}`,
            });
        }
    }

    /**
     * Obtém estatísticas de assinaturas
     */
    public async getSignatureStats(req: Request, res: Response): Promise<Response> {
        try {
            const stats = await SignatureService.getSignatureStats();

            return res.status(200).json({
                sucesso: true,
                dados: stats,
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: '❌ Erro ao buscar estatísticas',
            });
        }
    }

    /**
     * Obtém IP do cliente
     */
    private getClientIp(req: Request): string {
        return (
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.socket.remoteAddress ||
            'desconhecido'
        );
    }
}

export default new SignatureController();
