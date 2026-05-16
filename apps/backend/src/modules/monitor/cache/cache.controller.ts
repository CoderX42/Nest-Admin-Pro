import { Controller, Get, Post, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { JwtAuthGuard } from '../../../auth/jwt.guard';

@ApiTags('Monitor - Cache')
@Controller('monitor/cache')
@UseGuards(JwtAuthGuard)
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get Redis cache info' })
  async info() {
    return this.cacheService.info();
  }

  @Get('keys')
  @ApiOperation({ summary: 'Get cache keys' })
  async keys(@Query('pattern') pattern: string) {
    return this.cacheService.keys(pattern || '*');
  }

  @Get('value')
  @ApiOperation({ summary: 'Get cache value by key' })
  async value(@Query('key') key: string) {
    return this.cacheService.get(key);
  }

  @Post('clear')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clear all cache' })
  async clear() {
    return this.cacheService.clear();
  }

  @Post('delete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete cache by key' })
  async delete(@Query('key') key: string) {
    return this.cacheService.delete(key);
  }
}