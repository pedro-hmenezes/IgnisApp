import mongoose from 'mongoose';
import Occurrence from '../Models/Occurrence.js';
import SignatureModel from '../Models/Signature.js';
import { MediaModel } from '../Models/Media.js';
import { CloudStorageService } from './CloudStorageService.js';

export interface FinalizeOccurrencePayload {
    // Dados do Relatório Operacional
    viaturaEmpenhada: string;
    equipe: string;
    descricaoAcoes: string;
    
    // Localização GPS final
    latitudeFinal: number;
    longitudeFinal: number;
    
    // Dados da Assinatura
    signerName: string;
    signerRole: string;
    signatureUrl?: string; // URL do Cloudinary (novo - prioridade)
    signatureData?: string; // Base64 legado (compatibilidade)
    
    // IDs de fotos já enviadas (opcional - se já foram enviadas antes)
    photosIds?: string[];
}

export class OccurrenceFinalizationService {
    /**
     * Finaliza uma ocorrência completamente em uma única chamada
     * - Salva dados do relatório operacional
     * - Cria a assinatura
     * - Vincula fotos (se enviadas)
     * - Atualiza GPS final
     * - Marca como finalizada
     */
    public async finalizeOccurrence(
        occurrenceId: string,
        userId: mongoose.Types.ObjectId,
        data: FinalizeOccurrencePayload,
        ipAddress?: string,
        userAgent?: string
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            console.log('=== INICIANDO FINALIZAÇÃO COMPLETA ===');
            console.log('OccurrenceId:', occurrenceId);
            console.log('UserId:', userId);

            // 1. Buscar e validar ocorrência
            const occurrence = await Occurrence.findById(occurrenceId).session(session);
            
            if (!occurrence) {
                throw new Error('Ocorrência não encontrada');
            }

            const statusNormalizado = occurrence.statusGeral?.toString().toLowerCase().trim();
            if (statusNormalizado !== 'em andamento') {
                throw new Error(`Não é possível finalizar ocorrência com status: ${occurrence.statusGeral}`);
            }

            // Verificar se já existe assinatura
            const existingSignature = await SignatureModel.findOne({
                occurrenceId: new mongoose.Types.ObjectId(occurrenceId),
            }).session(session);

            if (existingSignature) {
                throw new Error('Esta ocorrência já possui uma assinatura registrada');
            }

            // 2. Criar assinatura
            console.log('📝 Criando assinatura...');
            const signature = new SignatureModel({
                occurrenceId: new mongoose.Types.ObjectId(occurrenceId),
                signerName: data.signerName.trim(),
                signerRole: data.signerRole.trim(),
                signatureUrl: data.signatureUrl, // URL do Cloudinary (prioridade)
                signatureData: data.signatureData, // Base64 legado (compatibilidade)
                signedAt: new Date(),
                ipAddress,
                userAgent,
                deviceInfo: {
                    platform: 'mobile',
                    timestamp: new Date(),
                },
            });

            await signature.save({ session });
            console.log('✅ Assinatura criada:', signature._id);

            // 3. Atualizar ocorrência com TODOS os dados
            console.log('📋 Atualizando ocorrência...');
            occurrence.viaturaEmpenhada = data.viaturaEmpenhada.trim();
            occurrence.equipe = data.equipe.trim();
            occurrence.descricaoAcoes = data.descricaoAcoes.trim();
            occurrence.latitudeFinal = data.latitudeFinal;
            occurrence.longitudeFinal = data.longitudeFinal;
            occurrence.signature = signature._id as mongoose.Types.ObjectId;
            occurrence.statusGeral = 'finalizada';
            occurrence.finalizadoPor = userId;
            occurrence.finalizadoEm = new Date();

            await occurrence.save({ session });
            console.log('✅ Ocorrência atualizada');

            // 4. Vincular fotos (se foram enviadas)
            if (data.photosIds && data.photosIds.length > 0) {
                console.log(`📸 Vinculando ${data.photosIds.length} fotos...`);
                await MediaModel.updateMany(
                    { _id: { $in: data.photosIds.map(id => new mongoose.Types.ObjectId(id)) } },
                    { $set: { occurrenceId: new mongoose.Types.ObjectId(occurrenceId) } },
                    { session }
                );
                console.log('✅ Fotos vinculadas');
            }

            // 5. Commit da transação
            await session.commitTransaction();
            console.log('✅ FINALIZAÇÃO COMPLETA COM SUCESSO!');

            return {
                occurrence: {
                    _id: occurrence._id,
                    numAviso: occurrence.numAviso,
                    statusGeral: occurrence.statusGeral,
                    finalizadoEm: occurrence.finalizadoEm,
                    viaturaEmpenhada: occurrence.viaturaEmpenhada,
                    equipe: occurrence.equipe,
                },
                signature: {
                    _id: signature._id,
                    signerName: signature.signerName,
                    signerRole: signature.signerRole,
                    signedAt: signature.signedAt,
                    // ✅ Priorizar URL do Cloudinary
                    signatureUrl: signature.signatureUrl || null,
                    // Só retornar base64 se não tiver URL (compatibilidade)
                    signatureData: signature.signatureUrl ? null : signature.signatureData,
                },
                photosCount: data.photosIds?.length || 0,
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Erro na finalização:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Busca detalhes completos de uma ocorrência finalizada
     */
    public async getFinalizedOccurrenceDetails(occurrenceId: string) {
        try {
            const occurrence = await Occurrence.findById(occurrenceId)
                .populate('signature')
                .populate('finalizadoPor', 'nome email');

            if (!occurrence) {
                throw new Error('Ocorrência não encontrada');
            }

            // Buscar fotos vinculadas
            const photos = await MediaModel.find({ occurrenceId: new mongoose.Types.ObjectId(occurrenceId) });

            // ✅ Priorizar URL do Cloudinary na assinatura
            let signatureToReturn = null;
            if (occurrence.signature) {
                const sig = occurrence.signature as any;
                signatureToReturn = {
                    _id: sig._id,
                    signerName: sig.signerName,
                    signerRole: sig.signerRole,
                    signedAt: sig.signedAt,
                    // Se tem URL do Cloudinary, usa ela. Senão, usa base64 legado
                    signatureUrl: sig.signatureUrl || null,
                    signatureData: sig.signatureUrl ? null : sig.signatureData,
                };
            }

            return {
                occurrence: {
                    ...occurrence.toObject(),
                    signature: signatureToReturn, // Substituir signature com dados processados
                },
                photos,
                hasReport: !!(occurrence.viaturaEmpenhada && occurrence.equipe && occurrence.descricaoAcoes),
                hasSignature: !!occurrence.signature,
                hasPhotos: photos.length > 0,
            };
        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            throw error;
        }
    }
}

export default new OccurrenceFinalizationService();
