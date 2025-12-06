import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMedia extends Document {
    occurrenceId?: Types.ObjectId; // Referência para a ocorrência
    name: string;
    fileType: 'image' | 'video' | 'document' | 'unknown';
    filePath: string; // Caminho no Google Cloud Storage
    fileUrl?: string; // URL assinada do arquivo
    capturedAt: Date;
    size: number;
    mimeType: string;
    uploaded: boolean;
    cloudStorage: boolean; // Indica se está no GCS
    uploadedBy?: Types.ObjectId; // ID do usuário que fez upload
    metadata?: {
        width?: number;
        height?: number;
        duration?: number; // Para vídeos
        [key: string]: any;
    };
}

const MediaSchema: Schema = new Schema(
    {
        occurrenceId: { type: Schema.Types.ObjectId, ref: 'Occurrence' },
        name: { type: String, required: true },
        fileType: {
            type: String,
            enum: ['image', 'video', 'document', 'unknown'],
            default: 'unknown',
        },
        filePath: { type: String, required: true },
        fileUrl: { type: String },
        capturedAt: { type: Date, default: Date.now },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true },
        uploaded: { type: Boolean, default: false },
        cloudStorage: { type: Boolean, default: true }, // GCS por padrão
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

export const MediaModel = mongoose.model<IMedia>('Media', MediaSchema);