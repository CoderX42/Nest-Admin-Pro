import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/modules/system/user/user.entity';
import { OnlineService } from './online.service';
import { OnlineController } from './online.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [OnlineController],
  providers: [OnlineService],
  exports: [OnlineService],
})
export class OnlineModule {}
