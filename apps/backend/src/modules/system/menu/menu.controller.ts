import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, QueryMenuDto } from './dto/menu.dto';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('System - Menu Management')
@Controller('system/menu')
@UseGuards(PermissionGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('list')
  @RequirePermission('system:menu:list')
  @ApiOperation({ summary: 'Get menu list' })
  async list(@Query() query: QueryMenuDto) {
    return this.menuService.list(query);
  }

  @Get('tree')
  @RequirePermission('system:menu:list')
  @ApiOperation({ summary: 'Get menu tree' })
  async tree() {
    return this.menuService.tree();
  }

  @Get('build-route')
  @RequirePermission('system:menu:list')
  @ApiOperation({ summary: 'Build menu route for current user' })
  async buildRoute(@Query('userId') userId: number) {
    return this.menuService.buildRoute(userId);
  }

  @Get(':id')
  @RequirePermission('system:menu:list')
  @ApiOperation({ summary: 'Get menu by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Post()
  @RequirePermission('system:menu:list')
  @ApiOperation({ summary: 'Create menu' })
  async create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Put()
  @RequirePermission('system:menu:list')
  @ApiOperation({ summary: 'Update menu' })
  async update(@Body() dto: UpdateMenuDto) {
    return this.menuService.update(dto);
  }

  @Delete(':id')
  @RequirePermission('system:menu:list')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete menu' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
