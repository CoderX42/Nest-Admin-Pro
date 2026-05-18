import type { Multer } from 'multer';

export type FileStorageProvider =
  | 'local'
  | 'aliyun-oss'
  | 'tencent-cos'
  | 'qiniu-kodo'
  | 'huawei-obs';

export interface FileStorageConfig {
  storage: FileStorageProvider;
  uploadDir: string;
  maxImageSize: number;
  maxFileSize: number;
  region: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
  prefix: string;
  publicUrl: string;
  secure: boolean;
}

export interface FileUploadResult {
  url: string;
  filename: string;
  key: string;
  size: number;
  storage: FileStorageProvider;
}

export interface StorageProvider {
  readonly type: FileStorageProvider;
  upload(file: Multer.File, key: string): Promise<FileUploadResult>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

export interface StorageProviderOptions {
  config: FileStorageConfig;
}
