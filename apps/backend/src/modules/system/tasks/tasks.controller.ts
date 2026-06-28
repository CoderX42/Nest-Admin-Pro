import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Perm } from '@/common/decorators/perm.decorator';
import { IdParam } from '@/common/decorators/id-param.decorator';
import { OperLog } from '@/common/decorators/oper-log.decorator';
import { CurrentUser, IAuthUser } from '@/common/decorators/current-user.decorator';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ListTaskQueryDto } from './dto/list-task.dto';
import { ListTaskLogQueryDto } from './dto/list-task-log.dto';
import { TaskStatusDto } from './dto/status-task.dto';

@ApiTags('System - 定时任务')
@ApiBearerAuth()
@Controller('monitor/task')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get('mission')
  @ApiOperation({ summary: '列出已注册 mission（前端表单下拉）' })
  @Perm('monitor:task:list')
  async missions() {
    return await this.tasks.listMissions();
  }

  @Get('log')
  @ApiOperation({ summary: '任务执行日志' })
  @Perm('monitor:task:log')
  async logs(@Query() query: ListTaskLogQueryDto) {
    return await this.tasks.logs(query);
  }

  @Get()
  @ApiOperation({ summary: '任务列表' })
  @Perm('monitor:task:list')
  async list(@Query() query: ListTaskQueryDto) {
    return await this.tasks.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '任务详情' })
  @Perm('monitor:task:list')
  async detail(@IdParam() id: number) {
    return await this.tasks.detail(id);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '创建任务' })
  @Perm('monitor:task:add')
  @OperLog({ module: '定时任务', action: '创建' })
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: IAuthUser) {
    return await this.tasks.create(dto, user.uid);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新任务' })
  @Perm('monitor:task:edit')
  @OperLog({ module: '定时任务', action: '更新' })
  async update(
    @IdParam() id: number,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return await this.tasks.update(id, dto, user.uid);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  @Perm('monitor:task:remove')
  @OperLog({ module: '定时任务', action: '删除' })
  async remove(@IdParam() id: number, @CurrentUser() user: IAuthUser) {
    return await this.tasks.remove(id, user.uid);
  }

  @Post(':id/run')
  @HttpCode(200)
  @ApiOperation({ summary: '立即执行一次任务' })
  @Perm('monitor:task:run')
  @OperLog({ module: '定时任务', action: '运行', saveParams: false })
  async run(@IdParam() id: number, @CurrentUser() user: IAuthUser) {
    return await this.tasks.runOnce(id, user.uid);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '启停任务（status: 0=停止 1=运行）' })
  @Perm('monitor:task:status')
  @OperLog({ module: '定时任务', action: '启停' })
  async setStatus(
    @IdParam() id: number,
    @Body() dto: TaskStatusDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return await this.tasks.setStatus(id, dto.status, user.uid);
  }
}
