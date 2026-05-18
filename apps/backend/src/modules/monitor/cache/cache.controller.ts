import { Controller, Get, Post, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('Monitor - Cache')
@Controller('monitor/cache')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('info')
  @RequirePermission('monitor:cache:list')
  @ApiOperation({ summary: 'Get Redis cache info' })
  async info() {
    return this.cacheService.info();
  }

  @Get('keys')
  @RequirePermission('monitor:cache:list')
  @ApiOperation({ summary: 'Get cache keys' })
  async keys(@Query('pattern') pattern: string) {
    return this.cacheService.keys(pattern || '*');
  }

  @Get('value')
  @RequirePermission('monitor:cache:list')
  @ApiOperation({ summary: 'Get cache value by key' })
  async value(@Query('key') key: string) {
    return this.cacheService.get(key);
  }

  @Post('clear')
  @RequirePermission('monitor:cache:list')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clear all cache' })
  async clear() {
    return this.cacheService.clear();
  }

  @Post('delete')
  @RequirePermission('monitor:cache:list')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete cache by key' })
  async delete(@Query('key') key: string) {
    return this.cacheService.delete(key);
  }
}
