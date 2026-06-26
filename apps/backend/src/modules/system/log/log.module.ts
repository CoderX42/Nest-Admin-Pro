import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoginLogEntity, OperLogEntity } from './log.entity';
import { LogController } from './log.controller';
import { LoginLogService, OperLogService } from './log.service';
import { OperLogInterceptor } from '@/common/interceptors/oper-log.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([LoginLogEntity, OperLogEntity])],
  controllers: [LogController],
  providers: [
    LoginLogService,
    OperLogService,
    { provide: APP_INTERCEPTOR, useClass: OperLogInterceptor },
  ],
  exports: [LoginLogService, OperLogService],
})
export class LogModule {}
