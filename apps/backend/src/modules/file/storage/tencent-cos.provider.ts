import type { Multer } from 'multer';
import type { FileStorageConfig, FileUploadResult, StorageProvider } from './storage.types';
import { assertCloudConfig, buildPublicUrl } from './storage.utils';

const COS = require('cos-nodejs-sdk-v5');

export class TencentCosProvider implements StorageProvider {
  readonly type = 'tencent-cos' as const;

  constructor(private config: FileStorageConfig) {
    assertCloudConfig(config, 'Tencent COS');
  }

  async upload(file: Multer.File, key: string): Promise<FileUploadResult> {
    const cos = new COS({
      SecretId: this.config.accessKeyId,
      SecretKey: this.config.accessKeySecret,
    });

    await new Promise<void>((resolve, reject) => {
      cos.putObject(
        {
          Bucket: this.config.bucket,
          Region: this.config.region,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || 'application/octet-stream',
        },
        (error: Error | null) => {
          if (error) reject(error);
          else resolve();
        },
      );
    });

    return {
      url: this.getPublicUrl(key),
      filename: file.originalname,
      key,
      size: file.size,
      storage: this.type,
    };
  }

  getPublicUrl(key: string) {
    if (this.config.publicUrl) {
      return buildPublicUrl(this.config.publicUrl, key);
    }
    const protocol = this.config.secure ? 'https' : 'http';
    return `${protocol}://${this.config.bucket}.cos.${this.config.region}.myqcloud.com/${key}`;
  }

  async delete(key: string) {
    const cos = new COS({
      SecretId: this.config.accessKeyId,
      SecretKey: this.config.accessKeySecret,
    });

    await new Promise<void>((resolve, reject) => {
      cos.deleteObject(
        {
          Bucket: this.config.bucket,
          Region: this.config.region,
          Key: key,
        },
        (error: Error | null) => {
          if (error) reject(error);
          else resolve();
        },
      );
    });
  }
}
