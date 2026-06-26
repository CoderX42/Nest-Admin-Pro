
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OperLog } from '@/common/decorators/oper-log.decorator';
import { Perm } from '@/common/decorators/perm.decorator';
import { IdParam } from '@/common/decorators/id-param.decorator';
import { LoginLogService, OperLogService } from './log.service';
import { ListLoginLogQueryDto, ListOperLogQueryDto } from './dto/log.dto';

@ApiTags('System - 日志管理')
@ApiBearerAuth()
@Controller('monitor')
export class LogController {
  constructor(
    private readonly loginLog: LoginLogService,
    private readonly operLog: OperLogService,
  ) {}

  // ============ 登录日志 ============

  @Get('login-log')
  @ApiOperation({ summary: '登录日志分页' })
  @Perm('monitor:login-log:list')
  async listLoginLog(@Query() query: ListLoginLogQueryDto) {
    return await this.loginLog.list(query);
  }

  @Delete('login-log/:id')
  @ApiOperation({ summary: '删除登录日志' })
  @Perm('monitor:login-log:delete')
  @OperLog({ module: '登录日志', action: '删除' })
  async removeLoginLog(@IdParam() id: number) {
    return await this.loginLog.remove(id);
  }

  @Post('login-log/clear')
  @HttpCode(200)
  @ApiOperation({ summary: '清空登录日志' })
  @Perm('monitor:login-log:clear')
  @OperLog({ module: '登录日志', action: '清空' })
  async clearLoginLog() {
    return await this.loginLog.clear();
  }

  // ============ 操作日志 ============

  @Get('oper-log')
  @ApiOperation({ summary: '操作日志分页' })
  @Perm('monitor:oper-log:list')
  async listOperLog(@Query() query: ListOperLogQueryDto) {
    return await this.operLog.list(query);
  }

  @Delete('oper-log/:id')
  @ApiOperation({ summary: '删除操作日志' })
  @Perm('monitor:oper-log:delete')
  @OperLog({ module: '操作日志', action: '删除' })
  async removeOperLog(@IdParam() id: number) {
    return await this.operLog.remove(id);
  }

  @Post('oper-log/clear')
  @HttpCode(200)
  @ApiOperation({ summary: '清空操作日志' })
  @Perm('monitor:oper-log:clear')
  @OperLog({ module: '操作日志', action: '清空' })
  async clearOperLog() {
    return await this.operLog.clear();
  }
}
