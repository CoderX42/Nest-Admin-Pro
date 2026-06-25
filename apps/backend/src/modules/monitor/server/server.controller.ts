import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServerService } from './server.service';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('Monitor - Server')
@Controller('monitor/server')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Get('info')
  @RequirePermission('monitor:server:list')
  @ApiOperation({ summary: 'Get server info' })
  async info() {
    return this.serverService.getInfo();
  }
}