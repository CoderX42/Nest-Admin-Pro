import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, QueryMenuDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';

@ApiTags('System - Menu Management')
@Controller('system/menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get menu list' })
  async list(@Query() query: QueryMenuDto) {
    return this.menuService.list(query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get menu tree' })
  async tree() {
    return this.menuService.tree();
  }

  @Get('build-route')
  @ApiOperation({ summary: 'Build menu route for current user' })
  async buildRoute(@Query('userId') userId: number) {
    return this.menuService.buildRoute(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create menu' })
  async create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Put()
  @ApiOperation({ summary: 'Update menu' })
  async update(@Body() dto: UpdateMenuDto) {
    return this.menuService.update(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete menu' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}