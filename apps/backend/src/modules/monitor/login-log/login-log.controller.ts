import { Controller, Get, Query, Param, ParseIntPipe, UseGuards, HttpCode, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginLogService } from './login-log.service';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('Monitor - Login Log')
@Controller('monitor/login-log')
@UseGuards(PermissionGuard)
export class LoginLogController {
  constructor(private readonly loginLogService: LoginLogService) {}

  @Get('list')
  @RequirePermission('monitor:loginLog:list')
  @ApiOperation({ summary: 'Get login log list' })
  async list(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('username') username: string,
    @Query('status') status: number,
  ) {
    return this.loginLogService.list({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      username,
      status: status !== undefined ? Number(status) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('monitor:loginLog:query')
  @ApiOperation({ summary: 'Get login log by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loginLogService.findOne(id);
  }

  @Delete('clean')
  @RequirePermission('monitor:loginLog:clean')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clean all login logs' })
  async clean() {
    return this.loginLogService.clean();
  }
}
