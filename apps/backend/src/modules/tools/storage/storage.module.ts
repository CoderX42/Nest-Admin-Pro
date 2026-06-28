import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageEntity } from './storage.entity';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { STORAGE_DRIVER } from './driver/storage-driver.interface';
import { LocalStorageDriver } from './driver/local-storage.driver';
import { QiniuStorageDriver } from './driver/qiniu-storage.driver';

@Module({
  imports: [TypeOrmModule.forFeature([StorageEntity])],
  controllers: [StorageController],
  providers: [
    StorageService,
    {
      provide: STORAGE_DRIVER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const name = config.get<string>('app.storageDriver') ?? 'local';
        if (name === 'qiniu') return new QiniuStorageDriver(config);
        return new LocalStorageDriver(config);
      },
    },
  ],
  exports: [TypeOrmModule, StorageService],
})
export class StorageModule {}
