import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictTypeEntity, DictItemEntity } from './dict.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DictTypeEntity, DictItemEntity])],
})
export class DictModule {}
