import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginLogEntity, OperLogEntity } from './log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoginLogEntity, OperLogEntity])],
})
export class LogModule {}
