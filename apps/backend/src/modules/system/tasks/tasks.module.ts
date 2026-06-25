import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity, TaskLogEntity } from './task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TaskLogEntity])],
})
export class TasksModule {}
