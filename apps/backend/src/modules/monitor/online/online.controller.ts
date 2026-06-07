import { Controller, Get, Param, ParseIntPipe, UseGuards, HttpCode, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OnlineService } from './online.service';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('Monitor - Online Users')
@Controller('monitor/online')
@UseGuards(PermissionGuard)
export class OnlineController {
  constructor(private readonly onlineService: OnlineService) {}

  @Get('list')
  @RequirePermission('monitor:online:list')
  @ApiOperation({ summary: 'Get online user list' })
  async list() {
    return this.onlineService.list();
  }

  @Post('force-logout/:token')
  @RequirePermission('monitor:online:forceLogout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Force logout user' })
  async forceLogout(@Param('token') token: string) {
    return this.onlineService.forceLogout(token);
  }
}
