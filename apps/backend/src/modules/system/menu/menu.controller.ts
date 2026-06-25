import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Perm } from '@/common/decorators/perm.decorator';
import { IdParam } from '@/common/decorators/id-param.decorator';
import { Public } from '@/common/decorators/public.decorator';

import { MenuService } from './menu.service';
import { CreateMenuDto, ListMenuQueryDto, UpdateMenuDto } from './dto/menu.dto';

@ApiTags('System - 菜单管理')
@ApiBearerAuth()
@Controller('system/menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: '菜单列表（默认树形，format=list 时扁平）' })
  @Perm('system:menu:list')
  async list(@Query() query: ListMenuQueryDto) {
    return await this.menuService.list(query);
  }

  @Get('all')
  @ApiOperation({ summary: '全部菜单（下拉用）' })
  @Public()
  async all() {
    return await this.menuService.list({ format: 'list' });
  }

  @Get(':id')
  @ApiOperation({ summary: '菜单详情' })
  @Perm('system:menu:detail')
  async detail(@IdParam() id: number) {
    return await this.menuService.detail(id);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '创建菜单' })
  @Perm('system:menu:create')
  async create(@Body() dto: CreateMenuDto) {
    return await this.menuService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新菜单' })
  @Perm('system:menu:update')
  async update(@IdParam() id: number, @Body() dto: UpdateMenuDto) {
    return await this.menuService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @Perm('system:menu:delete')
  async remove(@IdParam() id: number) {
    return await this.menuService.remove(id);
  }
}
