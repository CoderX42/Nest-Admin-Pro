import OSS = require('ali-oss');
import type { Multer } from 'multer';
import type { FileStorageConfig, FileUploadResult, StorageProvider } from './storage.types';
import { assertCloudConfig, buildPublicUrl } from './storage.utils';

export class AliyunOssProvider implements StorageProvider {
  readonly type = 'aliyun-oss' as const;

  constructor(private config: FileStorageConfig) {
    assertCloudConfig(config, 'Aliyun OSS');
  }

  async upload(file: Multer.File, key: string): Promise<FileUploadResult> {
    const result = await new OSS({
      region: this.config.region,
      bucket: this.config.bucket,
      accessKeyId: this.config.accessKeyId,
      accessKeySecret: this.config.accessKeySecret,
      endpoint: this.config.endpoint || undefined,
      secure: this.config.secure,
    }).put(key, file.buffer, {
      headers: {
        'Content-Type': file.mimetype || 'application/octet-stream',
      },
    });

    return {
      url: this.getPublicUrl(key, result.url),
      filename: file.originalname,
      key,
      size: file.size,
      storage: this.type,
    };
  }

  getPublicUrl(key: string, fallback?: string) {
    return buildPublicUrl(this.config.publicUrl, key, fallback);
  }

  async delete(key: string) {
    await new OSS({
      region: this.config.region,
      bucket: this.config.bucket,
      accessKeyId: this.config.accessKeyId,
      accessKeySecret: this.config.accessKeySecret,
      endpoint: this.config.endpoint || undefined,
      secure: this.config.secure,
    }).delete(key);
  }
}
