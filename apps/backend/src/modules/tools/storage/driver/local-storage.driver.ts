import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import { StorageDriver, UploadResult } from './storage-driver.interface';

/**
 * 本地磁盘存储驱动
 * - 文件落在 app.uploadDir（默认 ./uploads）下
 * - 通过 @fastify/static 在 /uploads/* 暴露为静态资源
 */
@Injectable()
export class LocalStorageDriver implements StorageDriver {
  readonly name = 'local';
  private readonly logger = new Logger(LocalStorageDriver.name);
  private readonly root: string;
  private readonly baseUrl: string;
  private readonly publicPrefix = '/uploads/';

  constructor(config: ConfigService) {
    this.root = path.resolve(config.get<string>('app.uploadDir') ?? './uploads');
    this.baseUrl = (config.get<string>('app.baseUrl') ?? 'http://localhost:3000').replace(/\/$/, '');
  }

  async upload(buffer: Buffer, filename: string, _mime: string): Promise<UploadResult> {
    await this.ensureDir(this.root);
    const full = path.join(this.root, filename);
    await fs.writeFile(full, buffer);
    this.logger.log(`local upload: ${filename} (${buffer.length} bytes)`);
    return {
      url: `${this.baseUrl}${this.publicPrefix}${filename}`,
      path: filename,
      driver: this.name,
    };
  }

  async remove(filePath: string): Promise<void> {
    // 只允许相对文件名，剥离任何前缀
    const safe = path.basename(filePath);
    const full = path.join(this.root, safe);
    try {
      await fs.unlink(full);
      this.logger.log(`local remove: ${safe}`);
    } catch (err: any) {
      if (err?.code === 'ENOENT') return; // 文件已不在，幂等
      throw err;
    }
  }

  getUrl(filePath: string): string {
    const safe = path.basename(filePath);
    return `${this.baseUrl}${this.publicPrefix}${safe}`;
  }

  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err: any) {
      if (err?.code !== 'EEXIST') throw err;
    }
  }
}
