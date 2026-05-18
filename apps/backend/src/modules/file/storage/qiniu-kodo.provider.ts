import type { Multer } from 'multer';
import type { FileStorageConfig, FileUploadResult, StorageProvider } from './storage.types';
import { assertCloudConfig, buildPublicUrl } from './storage.utils';

const qiniu = require('qiniu');

export class QiniuKodoProvider implements StorageProvider {
  readonly type = 'qiniu-kodo' as const;

  constructor(private config: FileStorageConfig) {
    assertCloudConfig(config, 'Qiniu Kodo');
  }

  async upload(file: Multer.File, key: string): Promise<FileUploadResult> {
    const mac = new qiniu.auth.digest.Mac(this.config.accessKeyId, this.config.accessKeySecret);
    const putPolicy = new qiniu.rs.PutPolicy({ scope: `${this.config.bucket}:${key}` });
    const uploadToken = putPolicy.uploadToken(mac);
    const uploadConfig = new qiniu.conf.Config();
    uploadConfig.zone = this.resolveZone(this.config.region);

    await new Promise<void>((resolve, reject) => {
      const formUploader = new qiniu.form_up.FormUploader(uploadConfig);
      const putExtra = new qiniu.form_up.PutExtra();
      formUploader.put(uploadToken, key, file.buffer, putExtra, (error: Error | null) => {
        if (error) reject(error);
        else resolve();
      });
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
    return buildPublicUrl(this.config.publicUrl, key);
  }

  async delete(key: string) {
    const mac = new qiniu.auth.digest.Mac(this.config.accessKeyId, this.config.accessKeySecret);
    const uploadConfig = new qiniu.conf.Config();
    uploadConfig.zone = this.resolveZone(this.config.region);
    const bucketManager = new qiniu.rs.BucketManager(mac, uploadConfig);

    await new Promise<void>((resolve, reject) => {
      bucketManager.delete(this.config.bucket, key, (error: Error | null) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  private resolveZone(region: string) {
    const zones: Record<string, any> = {
      z0: qiniu.zone.Zone_z0,
      z1: qiniu.zone.Zone_z1,
      z2: qiniu.zone.Zone_z2,
      na0: qiniu.zone.Zone_na0,
      as0: qiniu.zone.Zone_as0,
    };
    return zones[region] || zones.z0;
  }
}
