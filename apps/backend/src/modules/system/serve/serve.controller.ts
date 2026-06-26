import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Perm } from '@/common/decorators/perm.decorator';

import { ServeService, ServeStat } from './serve.service';

@ApiTags('System - 服务监控')
@ApiBearerAuth()
@Controller('monitor/serve')
export class ServeController {
  constructor(private readonly serve: ServeService) {}

  @Get()
  @ApiOperation({ summary: '服务状态监控（CPU / 内存 / 磁盘 / 网络 / 节点）' })
  @Perm('monitor:serve:list')
  async stats(): Promise<ServeStat> {
    return await this.serve.getStats();
  }
}
