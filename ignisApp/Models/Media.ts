import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
    name: string;
    fileType: string;
    filePath: string;
    capturedAt: Date;
    size: number;
    mimeType: string;
    uploaded: boolean;
}

const MediaSchema: Schema = new Schema({
    name: { type: String, required: true },
    fileType: { type: String, required: true },
    filePath: { type: String, required: true },
    capturedAt: { type: Date, default: Date.now },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploaded: { type: Boolean, default: false }
});

export const MediaModel = mongoose.model<IMedia>('Media', MediaSchema);