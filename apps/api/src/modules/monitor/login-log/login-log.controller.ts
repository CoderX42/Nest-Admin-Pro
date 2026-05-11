import { Controller, Get, Query, Param, ParseIntPipe, UseGuards, HttpCode, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginLogService } from './login-log.service';
import { JwtAuthGuard } from '../../../auth/jwt.guard';

@ApiTags('Monitor - Login Log')
@Controller('monitor/login-log')
@UseGuards(JwtAuthGuard)
export class LoginLogController {
  constructor(private readonly loginLogService: LoginLogService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get login log list' })
  async list(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('username') username: string,
    @Query('status') status: number,
  ) {
    return this.loginLogService.list({ page: page || 1, limit: limit || 10, username, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get login log by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loginLogService.findOne(id);
  }

  @Delete('clean')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clean all login logs' })
  async clean() {
    return this.loginLogService.clean();
  }
}