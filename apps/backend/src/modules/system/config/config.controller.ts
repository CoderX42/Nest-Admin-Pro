import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { CreateConfigDto, UpdateConfigDto, QueryConfigDto } from './dto/config.dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('System - Config')
@Controller('system/config')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('list')
  @RequirePermission('system:config:list')
  @ApiOperation({ summary: 'Get config list' })
  async list(@Query() query: QueryConfigDto) {
    return this.configService.list(query);
  }

  @Get('key/:key')
  @RequirePermission('system:config:list')
  @ApiOperation({ summary: 'Get config by key' })
  async findByKey(@Param('key') key: string) {
    return this.configService.findByKey(key);
  }

  @Get(':id')
  @RequirePermission('system:config:list')
  @ApiOperation({ summary: 'Get config by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.configService.findOne(id);
  }

  @Post()
  @RequirePermission('system:config:list')
  @ApiOperation({ summary: 'Create config' })
  async create(@Body() dto: CreateConfigDto) {
    return this.configService.create(dto);
  }

  @Put()
  @RequirePermission('system:config:list')
  @ApiOperation({ summary: 'Update config' })
  async update(@Body() dto: UpdateConfigDto) {
    return this.configService.update(dto);
  }

  @Delete(':id')
  @RequirePermission('system:config:list')
  @ApiOperation({ summary: 'Delete config' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.configService.remove(id);
  }

  @Put('refresh')
  @RequirePermission('system:config:list')
  @ApiOperation({ summary: 'Refresh config cache' })
  async refresh() {
    return this.configService.refresh();
  }
}
