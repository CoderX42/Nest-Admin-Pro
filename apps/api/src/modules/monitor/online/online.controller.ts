import { Controller, Get, Param, ParseIntPipe, UseGuards, HttpCode, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OnlineService } from './online.service';
import { JwtAuthGuard } from '../../../auth/jwt.guard';

@ApiTags('Monitor - Online Users')
@Controller('monitor/online')
@UseGuards(JwtAuthGuard)
export class OnlineController {
  constructor(private readonly onlineService: OnlineService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get online user list' })
  async list() {
    return this.onlineService.list();
  }

  @Post('force-logout/:token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Force logout user' })
  async forceLogout(@Param('token') token: string) {
    return this.onlineService.forceLogout(token);
  }
}