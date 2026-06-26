import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qiniu from 'qiniu';

import { StorageDriver, UploadResult } from './storage-driver.interface';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

/**
 * 七牛云对象存储驱动
 * - 通过环境变量 OSS_ACCESSKEY / OSS_SECRETKEY / OSS_BUCKET / OSS_DOMAIN 配置
 * - 凭证缺失时直接抛错，避免在生产环境静默落到本地
 */
@Injectable()
export class QiniuStorageDriver implements StorageDriver {
  readonly name = 'qiniu';
  private readonly logger = new Logger(QiniuStorageDriver.name);

  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly bucket: string;
  private readonly domain: string;
  private readonly zone: string;

  constructor(config: ConfigService) {
    this.accessKey = config.get<string>('oss.accessKey') ?? '';
    this.secretKey = config.get<string>('oss.secretKey') ?? '';
    this.bucket = config.get<string>('oss.bucket') ?? '';
    this.domain = config.get<string>('oss.domain') ?? '';
    this.zone = config.get<string>('oss.zone') ?? 'z0';
  }

  private assertConfigured(): void {
    if (!this.accessKey || !this.secretKey || !this.bucket) {
      throw new BusinessException(
        ErrorEnum.FAIL,
        '七牛云未配置（OSS_ACCESSKEY/SECRETKEY/BUCKET）',
      );
    }
  }

  private getMac() {
    return new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
  }

  private getZone() {
    const map: Record<string, qiniu.conf.Zone> = {
      z0: qiniu.zone.Zone_z0,
      z1: qiniu.zone.Zone_z1,
      z2: qiniu.zone.Zone_z2,
      na0: qiniu.zone.Zone_na0,
      as0: qiniu.zone.Zone_as0,
    };
    return map[this.zone] ?? qiniu.zone.Zone_z0;
  }

  async upload(buffer: Buffer, filename: string, _mime: string): Promise<UploadResult> {
    this.assertConfigured();

    const mac = this.getMac();
    const conf = new qiniu.conf.Config({ zone: this.getZone() });
    const formUploader = new qiniu.form_up.FormUploader(conf);
    const putExtra = new qiniu.form_up.PutExtra();
    const token = new qiniu.rs.PutPolicy({ scope: this.bucket }).uploadToken(mac);

    await new Promise<void>((resolve, reject) => {
      formUploader.put(token, filename, buffer, putExtra, (err, _body, _resp) => {
        if (err) return reject(err);
        resolve();
      });
    });

    this.logger.log(`qiniu upload: ${filename} (${buffer.length} bytes)`);
    return {
      url: this.getUrl(filename),
      path: filename,
      driver: this.name,
    };
  }

  async remove(key: string): Promise<void> {
    this.assertConfigured();
    const mac = this.getMac();
    const conf = new qiniu.conf.Config({ zone: this.getZone() });
    const bucketManager = new qiniu.rs.BucketManager(mac, conf);

    await new Promise<void>((resolve, reject) => {
      bucketManager.delete(this.bucket, key, (err, _resp) => {
        if (err) return reject(err);
        resolve();
      });
    });
    this.logger.log(`qiniu remove: ${key}`);
  }

  getUrl(key: string): string {
    const base = this.domain.replace(/\/$/, '');
    return base ? `${base}/${key}` : key;
  }
}
