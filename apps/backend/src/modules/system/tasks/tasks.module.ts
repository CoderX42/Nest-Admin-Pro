import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskEntity, TaskLogEntity } from './task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MissionsService } from './mission/missions.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TaskLogEntity])],
  controllers: [TasksController],
  providers: [TasksService, MissionsService],
  exports: [TasksService],
})
export class TasksModule {}
