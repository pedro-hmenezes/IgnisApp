import SignatureModel from '../Models/Signature.js';
import Occurrence from '../Models/Occurrence.js';
import type { ISignature } from '../Models/Signature.js';
import mongoose from 'mongoose';

type SignatureResponse = {
    signature: ISignature;
    occurrence: {
        _id: mongoose.Types.ObjectId;
        numAviso: string;
        statusGeral: 'em andamento' | 'finalizada' | 'cancelada';
        finalizadoEm: Date;
    };
};

export class SignatureService {
    /**
     * Salva assinatura e marca ocorrência como finalizada
     */
    public async saveSignature(
        occurrenceId: string,
        signerName: string,
        signatureData: string,
        userId: mongoose.Types.ObjectId,
        signerRole?: string,
        deviceInfo?: any,
        ipAddress?: string,
        userAgent?: string
    ): Promise<SignatureResponse> {
        try {
            console.log('=== SERVICE: Buscando ocorrência ===');
            console.log('OccurrenceId:', occurrenceId);
            
            // Validar que a ocorrência existe
            const occurrence = await Occurrence.findById(occurrenceId);
            
            if (!occurrence) {
                console.error('Ocorrência não encontrada com ID:', occurrenceId);
                throw new Error('Ocorrência não encontrada');
            }

            console.log('Ocorrência encontrada:');
            console.log('- ID:', occurrence._id);
            console.log('- NumAviso:', occurrence.numAviso);
            console.log('- Status:', occurrence.statusGeral);
            console.log('- Tipo do status:', typeof occurrence.statusGeral);

            // Verificar se já existe uma assinatura para esta ocorrência
            const existingSignature = await SignatureModel.findOne({
                occurrenceId: new mongoose.Types.ObjectId(occurrenceId),
            });

            if (existingSignature) {
                throw new Error('Esta ocorrência já possui uma assinatura registrada');
            }

            // Log para debug
            console.log('Status da ocorrência:', occurrence.statusGeral);
            console.log('Tipo do status:', typeof occurrence.statusGeral);

            // Validar que a ocorrência ainda está em andamento (case-insensitive)
            const statusNormalizado = occurrence.statusGeral?.toString().toLowerCase().trim();
            
            if (statusNormalizado !== 'em andamento') {
                throw new Error(
                    `Não é possível assinar ocorrência com status: ${occurrence.statusGeral}`
                );
            }

            // Validar campos obrigatórios da assinatura
            if (!signerName || signerName.trim().length === 0) {
                throw new Error('Nome do assinante é obrigatório');
            }

            if (!signatureData || signatureData.trim().length === 0) {
                throw new Error('Dados da assinatura são obrigatórios');
            }

            // Criar registro de assinatura
            const signature = new SignatureModel({
                occurrenceId: new mongoose.Types.ObjectId(occurrenceId),
                signerName: signerName.trim(),
                signerRole: signerRole?.trim(),
                signatureData,
                signedAt: new Date(),
                ipAddress,
                userAgent,
                deviceInfo: deviceInfo || {},
            });

            await signature.save();

            // Atualizar ocorrência
            occurrence.statusGeral = 'finalizada';
            occurrence.finalizadoPor = userId;
            occurrence.finalizadoEm = new Date();
            occurrence.signature = signature._id as mongoose.Types.ObjectId;

            await occurrence.save();

            // Retornar assinatura com dados da ocorrência
            const signatureObject = signature.toObject();

            return {
                signature: signatureObject as ISignature,
                occurrence: {
                    _id: occurrence._id as mongoose.Types.ObjectId,
                    numAviso: occurrence.numAviso,
                    statusGeral: occurrence.statusGeral,
                    finalizadoEm: occurrence.finalizadoEm,
                },
            };
        } catch (error) {
            console.error('Erro ao salvar assinatura:', error);
            throw error;
        }
    }

    /**
     * Obtém assinatura de uma ocorrência
     */
    public async getSignatureByOccurrence(occurrenceId: string): Promise<ISignature | null> {
        try {
            return await SignatureModel.findOne({
                occurrenceId: new mongoose.Types.ObjectId(occurrenceId),
            }).populate('occurrenceId');
        } catch (error) {
            console.error('Erro ao buscar assinatura:', error);
            throw new Error('Falha ao buscar assinatura');
        }
    }

    /**
     * Obtém assinatura por ID
     */
    public async getSignatureById(signatureId: string): Promise<ISignature | null> {
        try {
            return await SignatureModel.findById(signatureId).populate('occurrenceId');
        } catch (error) {
            console.error('Erro ao buscar assinatura:', error);
            throw new Error('Falha ao buscar assinatura');
        }
    }

    /**
     * Lista todas as assinaturas de um usuário
     */
    public async getSignaturesByUser(userId: string): Promise<ISignature[]> {
        try {
            return await SignatureModel.find({}).populate({
                path: 'occurrenceId',
                match: { finalizadoPor: new mongoose.Types.ObjectId(userId) },
            });
        } catch (error) {
            console.error('Erro ao listar assinaturas:', error);
            throw new Error('Falha ao listar assinaturas');
        }
    }

    /**
     * Atualiza uma assinatura
     */
    public async updateSignature(
        signatureId: string,
        updates: Partial<ISignature>
    ): Promise<ISignature | null> {
        try {
            return await SignatureModel.findByIdAndUpdate(signatureId, updates, {
                new: true,
            }).populate('occurrenceId');
        } catch (error) {
            console.error('Erro ao atualizar assinatura:', error);
            throw new Error('Falha ao atualizar assinatura');
        }
    }

    /**
     * Deleta uma assinatura
     */
    public async deleteSignature(signatureId: string): Promise<void> {
        try {
            const signature = await SignatureModel.findById(signatureId);
            if (!signature) {
                throw new Error('Assinatura não encontrada');
            }

            // Se a ocorrência não foi finalizada após a assinatura, pode deletar
            const occurrence = await Occurrence.findById(signature.occurrenceId);
            if (occurrence && occurrence.statusGeral === 'finalizada') {
                throw new Error(
                    'Não é possível deletar assinatura de ocorrência finalizada'
                );
            }

            await SignatureModel.findByIdAndDelete(signatureId);
        } catch (error) {
            console.error('Erro ao deletar assinatura:', error);
            throw error;
        }
    }

    /**
     * Valida dados da assinatura
     */
    public validateSignatureData(signatureData: string): boolean {
        if (!signatureData) return false;

        // Se for base64, validar
        if (signatureData.startsWith('data:image')) {
            try {
                const base64Regex =
                    /^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
                return base64Regex.test(signatureData);
            } catch {
                return false;
            }
        }

        // Se for URL, validar
        if (signatureData.startsWith('http')) {
            try {
                new URL(signatureData);
                return true;
            } catch {
                return false;
            }
        }

        return false;
    }

    /**
     * Obtém estatísticas de assinaturas
     */
    public async getSignatureStats(): Promise<{
        totalSignatures: number;
        finalizedOccurrences: number;
        averageSigningTime: number;
    }> {
        try {
            const totalSignatures = await SignatureModel.countDocuments();

            const finalizedOccurrences = await Occurrence.countDocuments({
                statusGeral: 'finalizada',
                signature: { $exists: true, $ne: null },
            });

            // Calcular tempo médio entre criação da ocorrência e assinatura
            const stats = await SignatureModel.aggregate([
                {
                    $lookup: {
                        from: 'occurrences',
                        localField: 'occurrenceId',
                        foreignField: '_id',
                        as: 'occurrence',
                    },
                },
                { $unwind: '$occurrence' },
                {
                    $project: {
                        timeDiff: {
                            $subtract: ['$signedAt', '$occurrence.createdAt'],
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        averageTime: { $avg: '$timeDiff' },
                    },
                },
            ]);

            const averageSigningTime = stats[0]?.averageTime || 0;

            return {
                totalSignatures,
                finalizedOccurrences,
                averageSigningTime: Math.round(averageSigningTime / 1000 / 60), // em minutos
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw new Error('Falha ao buscar estatísticas');
        }
    }
}

export default new SignatureService();
