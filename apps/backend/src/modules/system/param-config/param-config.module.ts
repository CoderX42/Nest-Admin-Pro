import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParamConfigEntity } from './param-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParamConfigEntity])],
})
export class ParamConfigModule {}
