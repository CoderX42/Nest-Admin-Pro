import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../common/prisma.service';
import { StorageProviderFactory } from './storage/storage-provider.factory';
import { createCloudObjectKey, createStoredName, normalizeOriginalName, normalizeStorageProvider } from './storage/storage.utils';
import type { FileStorageConfig, FileStorageProvider } from './storage/storage.types';

interface UpdateFileStorageConfigDto {
  storage?: FileStorageProvider | 'oss';
  uploadDir?: string;
  maxImageSize?: number | string;
  maxFileSize?: number | string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  endpoint?: string;
  prefix?: string;
  publicUrl?: string;
  secure?: boolean;
  ossRegion?: string;
  ossBucket?: string;
  ossAccessKeyId?: string;
  ossAccessKeySecret?: string;
  ossEndpoint?: string;
  ossPrefix?: string;
  ossPublicUrl?: string;
  ossSecure?: boolean;
}

interface QueryFileDto {
  page?: number | string;
  limit?: number | string;
  originalName?: string;
  storage?: string;
  mimeType?: string;
}

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async getConfig() {
    const config = await this.resolveConfig();
    return {
      ...config,
      accessKeySecret: '',
      hasAccessKeySecret: Boolean(config.accessKeySecret),
      // Backward-compatible field names for older clients.
      ossRegion: config.region,
      ossBucket: config.bucket,
      ossAccessKeyId: config.accessKeyId,
      ossAccessKeySecret: '',
      hasOssAccessKeySecret: Boolean(config.accessKeySecret),
      ossEndpoint: config.endpoint,
      ossPrefix: config.prefix,
      ossPublicUrl: config.publicUrl,
      ossSecure: config.secure,
    };
  }

  async updateConfig(dto: UpdateFileStorageConfigDto) {
    const current = await this.resolveConfig();
    const next: FileStorageConfig = {
      ...current,
      storage: dto.storage ? normalizeStorageProvider(dto.storage) : current.storage,
      uploadDir: dto.uploadDir ?? current.uploadDir,
      maxImageSize: this.toPositiveNumber(dto.maxImageSize, current.maxImageSize),
      maxFileSize: this.toPositiveNumber(dto.maxFileSize, current.maxFileSize),
      region: dto.region ?? dto.ossRegion ?? current.region,
      bucket: dto.bucket ?? dto.ossBucket ?? current.bucket,
      accessKeyId: dto.accessKeyId ?? dto.ossAccessKeyId ?? current.accessKeyId,
      accessKeySecret: dto.accessKeySecret || dto.ossAccessKeySecret || current.accessKeySecret,
      endpoint: dto.endpoint ?? dto.ossEndpoint ?? current.endpoint,
      prefix: dto.prefix ?? dto.ossPrefix ?? current.prefix,
      publicUrl: dto.publicUrl ?? dto.ossPublicUrl ?? current.publicUrl,
      secure: dto.secure ?? dto.ossSecure ?? current.secure,
    };

    await Promise.all([
      this.upsertConfig('file_storage', next.storage, 'string', '文件存储方式'),
      this.upsertConfig('file_upload_dir', next.uploadDir, 'string', '本地上传目录'),
      this.upsertConfig('file_max_image_size', String(next.maxImageSize), 'number', '图片上传大小限制(字节)'),
      this.upsertConfig('file_max_file_size', String(next.maxFileSize), 'number', '文件上传大小限制(字节)'),
      this.upsertConfig('file_cloud_region', next.region, 'string', '对象存储 Region'),
      this.upsertConfig('file_cloud_bucket', next.bucket, 'string', '对象存储 Bucket'),
      this.upsertConfig('file_cloud_access_key_id', next.accessKeyId, 'string', '对象存储 AccessKey ID'),
      this.upsertConfig('file_cloud_access_key_secret', next.accessKeySecret, 'string', '对象存储 AccessKey Secret'),
      this.upsertConfig('file_cloud_endpoint', next.endpoint, 'string', '对象存储 Endpoint'),
      this.upsertConfig('file_cloud_prefix', next.prefix, 'string', '对象存储前缀'),
      this.upsertConfig('file_cloud_public_url', next.publicUrl, 'string', '对象存储公开访问域名'),
      this.upsertConfig('file_cloud_secure', String(next.secure), 'boolean', '对象存储 HTTPS'),
    ]);

    return this.getConfig();
  }

  async list(query: QueryFileDto) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = this.toPositiveNumber(query.limit, 10);
    const where: any = { isDelete: 0 };
    if (query.originalName) where.originalName = { contains: query.originalName };
    if (query.storage) where.storage = query.storage;
    if (query.mimeType) where.mimeType = { contains: query.mimeType };

    const [total, items] = await Promise.all([
      this.prisma.sysFile.count({ where }),
      this.prisma.sysFile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
    ]);

    return { total, items };
  }

  async findOne(id: number) {
    const file = await this.prisma.sysFile.findFirst({
      where: { id, isDelete: 0 },
    });
    if (!file) throw new BadRequestException('File not found');
    return file;
  }

  async remove(id: number) {
    const file = await this.findOne(id);
    const config = await this.resolveConfig();
    const deleteConfig = {
      ...config,
      storage: normalizeStorageProvider(file.storage),
    };

    try {
      await StorageProviderFactory.create(deleteConfig).delete(file.objectKey);
    } catch {
      // Metadata deletion should still work if the remote object has already gone away.
    }

    await this.prisma.sysFile.update({
      where: { id },
      data: { isDelete: 1, deleteTime: new Date() },
    });
    return { success: true };
  }

  async upload(file: Express.Multer.File, user?: any) {
    const config = await this.resolveConfig();
    if (!file) throw new BadRequestException('No file uploaded');
    if (file.size > config.maxFileSize) throw new BadRequestException(`File size must be less than ${config.maxFileSize / 1024 / 1024}MB`);
    return this.saveFile(file, config, user);
  }

  async uploadImage(file: Express.Multer.File, user?: any) {
    const config = await this.resolveConfig();
    if (!file) throw new BadRequestException('No file uploaded');
    const originalName = normalizeOriginalName(file.originalname);
    const ext = path.extname(originalName).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    if (!imageExts.includes(ext)) throw new BadRequestException('Only image files are allowed');
    if (file.size > config.maxImageSize) throw new BadRequestException(`Image size must be less than ${config.maxImageSize / 1024 / 1024}MB`);
    return this.saveFile(file, config, user);
  }

  async preview(filename: string, res: any) {
    const config = await this.resolveConfig();
    const provider = StorageProviderFactory.create(config);
    if (config.storage !== 'local') {
      const url = provider.getPublicUrl(filename);
      return res.redirect(url);
    }

    const root = path.resolve(config.uploadDir);
    const filePath = path.resolve(root, path.basename(filename));
    if (!filePath.startsWith(root + path.sep)) {
      throw new BadRequestException('Invalid file path');
    }
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }
    return res.sendFile(filePath);
  }

  private async saveFile(file: Express.Multer.File, config: FileStorageConfig, user?: any) {
    if (!file.buffer) throw new BadRequestException('Invalid upload buffer');
    const originalName = normalizeOriginalName(file.originalname);
    const key = config.storage === 'local'
      ? createStoredName(originalName)
      : createCloudObjectKey(originalName, config.prefix);
    const result = await StorageProviderFactory.create(config).upload(file, key);
    await this.prisma.sysFile.create({
      data: {
        originalName,
        fileName: path.basename(result.key),
        objectKey: result.key,
        url: result.url,
        storage: result.storage,
        mimeType: file.mimetype || null,
        ext: path.extname(originalName).toLowerCase() || null,
        size: BigInt(file.size),
        uploaderId: user?.id ? BigInt(user.id) : null,
        uploaderName: user?.username || null,
      },
    });
    return result;
  }

  private async resolveConfig(): Promise<FileStorageConfig> {
    const configs = await this.prisma.sysConfig.findMany({
      where: {
        key: {
          in: [
            'file_storage',
            'file_upload_dir',
            'file_max_image_size',
            'file_max_file_size',
            'file_cloud_region',
            'file_cloud_bucket',
            'file_cloud_access_key_id',
            'file_cloud_access_key_secret',
            'file_cloud_endpoint',
            'file_cloud_prefix',
            'file_cloud_public_url',
            'file_cloud_secure',
            'file_oss_region',
            'file_oss_bucket',
            'file_oss_access_key_id',
            'file_oss_access_key_secret',
            'file_oss_endpoint',
            'file_oss_prefix',
            'file_oss_public_url',
            'file_oss_secure',
          ],
        },
        status: 1,
      },
    });
    const map = new Map<string, string>(
      configs.map((item) => [item.key, String(item.value ?? '')]),
    );

    return {
      storage: normalizeStorageProvider(map.get('file_storage') || process.env.FILE_STORAGE || 'local'),
      uploadDir: map.get('file_upload_dir') || process.env.UPLOAD_DIR || './uploads',
      maxImageSize: this.toPositiveNumber(map.get('file_max_image_size') || process.env.MAX_IMAGE_SIZE, 2097152),
      maxFileSize: this.toPositiveNumber(map.get('file_max_file_size') || process.env.MAX_FILE_SIZE, 104857600),
      region: map.get('file_cloud_region') || map.get('file_oss_region') || process.env.FILE_CLOUD_REGION || process.env.OSS_REGION || '',
      bucket: map.get('file_cloud_bucket') || map.get('file_oss_bucket') || process.env.FILE_CLOUD_BUCKET || process.env.OSS_BUCKET || '',
      accessKeyId: map.get('file_cloud_access_key_id') || map.get('file_oss_access_key_id') || process.env.FILE_CLOUD_ACCESS_KEY_ID || process.env.OSS_ACCESS_KEY_ID || '',
      accessKeySecret: map.get('file_cloud_access_key_secret') || map.get('file_oss_access_key_secret') || process.env.FILE_CLOUD_ACCESS_KEY_SECRET || process.env.OSS_ACCESS_KEY_SECRET || '',
      endpoint: map.get('file_cloud_endpoint') || map.get('file_oss_endpoint') || process.env.FILE_CLOUD_ENDPOINT || process.env.OSS_ENDPOINT || '',
      prefix: map.get('file_cloud_prefix') || map.get('file_oss_prefix') || process.env.FILE_CLOUD_PREFIX || process.env.OSS_PREFIX || 'uploads',
      publicUrl: map.get('file_cloud_public_url') || map.get('file_oss_public_url') || process.env.FILE_CLOUD_PUBLIC_URL || process.env.OSS_PUBLIC_URL || process.env.OSS_CDN_URL || '',
      secure: this.toBoolean(map.get('file_cloud_secure') || map.get('file_oss_secure') || process.env.FILE_CLOUD_SECURE || process.env.OSS_SECURE, true),
    };
  }

  private toPositiveNumber(value: number | string | undefined, fallback: number) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
  }

  private toBoolean(value: string | undefined, fallback: boolean) {
    if (value === undefined || value === '') return fallback;
    return value === 'true' || value === '1';
  }

  private async upsertConfig(key: string, value: string, type: string, remark: string) {
    await this.prisma.sysConfig.upsert({
      where: { key },
      update: { value, type, remark, status: 1 },
      create: {
        name: this.getConfigName(key),
        key,
        value,
        type,
        remark,
        status: 1,
      },
    });
  }

  private getConfigName(key: string) {
    const names: Record<string, string> = {
      file_storage: '文件存储方式',
      file_upload_dir: '本地上传目录',
      file_max_image_size: '图片上传大小',
      file_max_file_size: '文件上传大小',
      file_cloud_region: '对象存储 Region',
      file_cloud_bucket: '对象存储 Bucket',
      file_cloud_access_key_id: '对象存储 AccessKey ID',
      file_cloud_access_key_secret: '对象存储 AccessKey Secret',
      file_cloud_endpoint: '对象存储 Endpoint',
      file_cloud_prefix: '对象存储前缀',
      file_cloud_public_url: '对象存储公开访问域名',
      file_cloud_secure: '对象存储 HTTPS',
      file_oss_region: 'OSS Region',
      file_oss_bucket: 'OSS Bucket',
      file_oss_access_key_id: 'OSS AccessKey ID',
      file_oss_access_key_secret: 'OSS AccessKey Secret',
      file_oss_endpoint: 'OSS Endpoint',
      file_oss_prefix: 'OSS 对象前缀',
      file_oss_public_url: 'OSS 公开访问域名',
      file_oss_secure: 'OSS HTTPS',
    };
    return names[key] || key;
  }
}
