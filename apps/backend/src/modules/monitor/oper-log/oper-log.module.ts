import { Module } from '@nestjs/common';
import { OperLogController } from './oper-log.controller';
import { OperLogService } from './oper-log.service';

@Module({
  controllers: [OperLogController],
  providers: [OperLogService],
  exports: [OperLogService],
})
export class OperLogModule {}