import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptEntity } from './dept.entity';
import { UserEntity } from '@/modules/system/user/user.entity';
import { DeptController } from './dept.controller';
import { DeptService } from './dept.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeptEntity, UserEntity])],
  controllers: [DeptController],
  providers: [DeptService],
  exports: [DeptService],
})
export class DeptModule {}
