import { Inject, Injectable, Logger, OnApplicationBootstrap, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'node:path';
import type { FastifyRequest } from 'fastify';

import { StorageEntity } from './storage.entity';
import { ListStorageQueryDto } from './dto/list-storage.dto';
import { paginate, Pagination } from '@/helper/paginate';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';
import {
  STORAGE_DRIVER,
  StorageDriver,
} from './driver/storage-driver.interface';
import { LocalStorageDriver } from './driver/local-storage.driver';

@Injectable()
export class StorageService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StorageService.name);
  private readonly drivers = new Map<string, StorageDriver>();

  constructor(
    @InjectRepository(StorageEntity) private readonly repo: Repository<StorageEntity>,
    private readonly config: ConfigService,
    @Optional() @Inject(STORAGE_DRIVER) driver?: StorageDriver,
  ) {
    if (driver) this.registerDriver(driver);
  }

  /** 模块启动时集中注册多个驱动 */
  registerDriver(driver: StorageDriver): void {
    this.drivers.set(driver.name, driver);
    this.logger.log(`storage driver registered: ${driver.name}`);
  }

  private getDriver(name?: string): StorageDriver {
    const key = name ?? this.config.get<string>('app.storageDriver') ?? 'local';
    const d = this.drivers.get(key);
    if (!d) {
      throw new BusinessException(
        ErrorEnum.FAIL,
        `未注册的存储驱动: ${key}（已注册: ${Array.from(this.drivers.keys()).join(',')}）`,
      );
    }
    return d;
  }

  /**
   * 消费 Fastify multipart 上传的单文件
   * - 使用 req.parts() 同时拿到 file 与 fields（驱动名等）
   */
  async upload(req: FastifyRequest, uid: number): Promise<StorageEntity> {
    let filePart: any = null;
    let driverName: string | undefined;

    const parts = req.parts();
    for await (const part of parts) {
      if (part.type === 'file') {
        if (filePart) {
          // 已拿到文件，丢弃后续文件 part
          await part.toBuffer().catch(() => undefined);
          continue;
        }
        filePart = part;
      } else if (part.type === 'field' && part.fieldname === 'driver') {
        driverName = String(part.value ?? '').trim() || undefined;
      }
    }

    if (!filePart) {
      throw new BusinessException(ErrorEnum.FILE_EMPTY);
    }

    const originalName = Buffer.from(filePart.filename ?? 'unnamed', 'latin1').toString('utf8');
    const ext = (path.extname(originalName) || '').toLowerCase().replace(/^\./, '') || 'bin';
    const mime = filePart.mimetype || 'application/octet-stream';

    // 拒绝超大文件（fastify-multipart 也会拦一道，这里再保险一次）
    const maxSize = this.config.get<number>('app.maxFileSize') ?? 104857600;
    const buffer = await filePart.toBuffer();
    if (buffer.length > maxSize) {
      throw new BusinessException(ErrorEnum.FILE_TOO_LARGE);
    }

    const filename = `${uuidv4()}.${ext}`;
    const driver = this.getDriver(driverName);
    const result = await driver.upload(buffer, filename, mime);

    const entity = this.repo.create({
      uid,
      originalName,
      filename,
      ext,
      mime,
      driver: result.driver,
      url: result.url,
      path: result.path,
      size: buffer.length,
    });
    const saved = await this.repo.save(entity);
    this.logger.log(`upload saved: id=${saved.id} ${originalName} -> ${filename} via ${result.driver}`);
    return saved;
  }

  async list(query: ListStorageQueryDto): Promise<Pagination<StorageEntity>> {
    const qb = this.repo.createQueryBuilder('s').orderBy('s.id', 'DESC');
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere('(s.originalName LIKE :kw OR s.filename LIKE :kw)', { kw });
    }
    if (query.driver) {
      qb.andWhere('s.driver = :driver', { driver: query.driver });
    }
    return await paginate<StorageEntity>(qb, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  async detail(id: number): Promise<StorageEntity> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new BusinessException(ErrorEnum.FILE_NOT_FOUND);
    return s;
  }

  async remove(id: number, uid: number): Promise<{ id: number }> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new BusinessException(ErrorEnum.FILE_NOT_FOUND);

    const driver = this.getDriver(s.driver);
    try {
      await driver.remove(s.path ?? s.filename);
    } catch (err) {
      // 物理删除失败只警告，不阻断数据库记录清理
      this.logger.warn(
        `storage remove: driver cleanup failed id=${id} path=${s.path} err=${(err as Error).message}`,
      );
    }
    await this.repo.delete(id);
    this.logger.log(`storage removed: id=${id} by uid=${uid}`);
    return { id };
  }

  /** 静态服务根，供 @fastify/static 注册 */
  getLocalRootDir(): string {
    return path.resolve(this.config.get<string>('app.uploadDir') ?? './uploads');
  }

  /** 启动时回填本地驱动（如果默认驱动是 qiniu 等） */
  onApplicationBootstrap(): void {
    if (!this.drivers.has('local')) {
      this.registerDriver(new LocalStorageDriver(this.config));
    }
  }
}
