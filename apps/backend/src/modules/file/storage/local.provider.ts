import * as fs from 'fs';
import * as path from 'path';
import type { Multer } from 'multer';
import type { FileUploadResult, StorageProvider, FileStorageConfig } from './storage.types';

export class LocalStorageProvider implements StorageProvider {
  readonly type = 'local' as const;

  constructor(private config: FileStorageConfig) {}

  async upload(file: Multer.File, key: string): Promise<FileUploadResult> {
    if (!fs.existsSync(this.config.uploadDir)) {
      fs.mkdirSync(this.config.uploadDir, { recursive: true });
    }

    const safeKey = path.basename(key);
    fs.writeFileSync(path.join(this.config.uploadDir, safeKey), file.buffer);

    return {
      url: this.getPublicUrl(safeKey),
      filename: file.originalname,
      key: safeKey,
      size: file.size,
      storage: this.type,
    };
  }

  getPublicUrl(key: string) {
    return `/file/${path.basename(key)}`;
  }

  async delete(key: string) {
    const filePath = this.resolvePath(key);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  resolvePath(key: string) {
    const root = path.resolve(this.config.uploadDir);
    const filePath = path.resolve(root, path.basename(key));
    if (!filePath.startsWith(root + path.sep)) return null;
    return filePath;
  }
}
