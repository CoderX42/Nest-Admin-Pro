import type { FileStorageConfig, StorageProvider } from './storage.types';
import { AliyunOssProvider } from './aliyun-oss.provider';
import { HuaweiObsProvider } from './huawei-obs.provider';
import { LocalStorageProvider } from './local.provider';
import { QiniuKodoProvider } from './qiniu-kodo.provider';
import { TencentCosProvider } from './tencent-cos.provider';

export class StorageProviderFactory {
  static create(config: FileStorageConfig): StorageProvider {
    switch (config.storage) {
      case 'aliyun-oss':
        return new AliyunOssProvider(config);
      case 'tencent-cos':
        return new TencentCosProvider(config);
      case 'qiniu-kodo':
        return new QiniuKodoProvider(config);
      case 'huawei-obs':
        return new HuaweiObsProvider(config);
      case 'local':
      default:
        return new LocalStorageProvider(config);
    }
  }
}
