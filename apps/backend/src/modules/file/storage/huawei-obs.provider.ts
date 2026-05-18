import { BadRequestException } from '@nestjs/common';
import type { Multer } from 'multer';
import type { FileStorageConfig, FileUploadResult, StorageProvider } from './storage.types';
import { assertCloudConfig, buildPublicUrl } from './storage.utils';

const ObsClient = require('esdk-obs-nodejs');

export class HuaweiObsProvider implements StorageProvider {
  readonly type = 'huawei-obs' as const;

  constructor(private config: FileStorageConfig) {
    assertCloudConfig(config, 'Huawei OBS');
    if (!config.endpoint) {
      throw new BadRequestException('Huawei OBS endpoint is required');
    }
  }

  async upload(file: Multer.File, key: string): Promise<FileUploadResult> {
    const client = new ObsClient({
      access_key_id: this.config.accessKeyId,
      secret_access_key: this.config.accessKeySecret,
      server: this.config.endpoint,
      is_secure: this.config.secure,
    });

    await new Promise<void>((resolve, reject) => {
      client.putObject(
        {
          Bucket: this.config.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || 'application/octet-stream',
        },
        (error: Error | null, result: any) => {
          if (error) {
            reject(error);
            return;
          }
          if (result?.CommonMsg?.Status && result.CommonMsg.Status >= 300) {
            reject(new Error(result.CommonMsg.Message || 'Huawei OBS upload failed'));
            return;
          }
          resolve();
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
    return buildPublicUrl(this.config.endpoint, `${this.config.bucket}/${key}`);
  }

  async delete(key: string) {
    const client = new ObsClient({
      access_key_id: this.config.accessKeyId,
      secret_access_key: this.config.accessKeySecret,
      server: this.config.endpoint,
      is_secure: this.config.secure,
    });

    await new Promise<void>((resolve, reject) => {
      client.deleteObject(
        {
          Bucket: this.config.bucket,
          Key: key,
        },
        (error: Error | null, result: any) => {
          if (error) {
            reject(error);
            return;
          }
          if (result?.CommonMsg?.Status && result.CommonMsg.Status >= 300) {
            reject(new Error(result.CommonMsg.Message || 'Huawei OBS delete failed'));
            return;
          }
          resolve();
        },
      );
    });
  }
}
