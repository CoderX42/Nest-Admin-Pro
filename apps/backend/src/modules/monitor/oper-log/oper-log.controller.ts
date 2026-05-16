import { Controller, Get, Query, Param, ParseIntPipe, UseGuards, HttpCode, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OperLogService } from './oper-log.service';
import { JwtAuthGuard } from '../../../auth/jwt.guard';

@ApiTags('Monitor - Operation Log')
@Controller('monitor/oper-log')
@UseGuards(JwtAuthGuard)
export class OperLogController {
  constructor(private readonly operLogService: OperLogService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get operation log list' })
  async list(@Query() query: any) {
    return this.operLogService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get operation log by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.operLogService.findOne(id);
  }

  @Delete('clean')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clean all operation logs' })
  async clean() {
    return this.operLogService.clean();
  }
}
