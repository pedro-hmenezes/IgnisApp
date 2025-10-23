import { MediaModel } from '../Models/Media';
import type { IMedia } from '../Models/Media';

export class MediaService {
    public async create(mediaData: Partial<IMedia>): Promise<IMedia> {
        const media = new MediaModel(mediaData);
        return await media.save();
    }

    public async getAll(): Promise<IMedia[]> {
        return await MediaModel.find();
    }

    public async getById(id: string): Promise<IMedia | null> {
        return await MediaModel.findById(id);
    }

    public async update(id: string, updateData: Partial<IMedia>): Promise<IMedia | null> {
        return await MediaModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    public async delete(id: string): Promise<void> {
        await MediaModel.findByIdAndDelete(id);
    }
}