import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISignature extends Document {
    occurrenceId: Types.ObjectId;
    signerName: string;
    signerRole?: string; // Ex: "Bombeiro", "Coordenador"
    signatureData: string; // Base64 ou caminho do arquivo no GCS
    signedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: {
        platform?: string;
        screenResolution?: string;
        timestamp?: Date;
    };
}

const SignatureSchema: Schema<ISignature & Document> = new Schema(
    {
        occurrenceId: {
            type: Schema.Types.ObjectId,
            ref: 'Occurrence',
            required: true,
            index: true
        },
        signerName: {
            type: String,
            required: true,
            trim: true
        },
        signerRole: {
            type: String,
            trim: true
        },
        signatureData: {
            type: String,
            required: true,
            // Pode ser Base64 ou URL do arquivo no GCS
        },
        signedAt: {
            type: Date,
            default: Date.now,
            required: true
        },
        ipAddress: String,
        userAgent: String,
        deviceInfo: {
            platform: String,
            screenResolution: String,
            timestamp: Date,
        },
    },
    { timestamps: true }
);

// Índice composto para buscar assinaturas de uma ocorrência
SignatureSchema.index({ occurrenceId: 1, signedAt: -1 });

export default mongoose.model<ISignature>('Signature', SignatureSchema);