import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageEntity } from './storage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StorageEntity])],
  exports: [TypeOrmModule],
})
export class StorageModule {}
