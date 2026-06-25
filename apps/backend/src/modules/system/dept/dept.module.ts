import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptEntity } from './dept.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeptEntity])],
})
export class DeptModule {}
