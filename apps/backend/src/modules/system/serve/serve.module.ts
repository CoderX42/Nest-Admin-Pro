import { Module } from '@nestjs/common';

import { ServeService } from './serve.service';
import { ServeController } from './serve.controller';

@Module({
  controllers: [ServeController],
  providers: [ServeService],
  exports: [ServeService],
})
export class ServeModule {}
