declare module 'multer-storage-cloudinary' {
  import { StorageEngine } from 'multer';
  import { v2 as cloudinary } from 'cloudinary';

  interface CloudinaryStorageOptions {
    cloudinary: typeof cloudinary;
    params: (req: Express.Request, file: Express.Multer.File) => Promise<any> | any;
  }

  class CloudinaryStorage implements StorageEngine {
    constructor(options: CloudinaryStorageOptions);
    _handleFile(req: Express.Request, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void;
    _removeFile(req: Express.Request, file: Express.Multer.File, cb: (error: Error | null) => void): void;
  }

  export default CloudinaryStorage;
}
