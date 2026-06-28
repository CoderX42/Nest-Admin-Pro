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

import { RoleService } from './role.service';
import {
  AssignMenusDto,
  CreateRoleDto,
  ListRoleQueryDto,
  UpdateRoleDto,
} from './dto/role.dto';

@ApiTags('System - 角色管理')
@ApiBearerAuth()
@Controller('system/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: '角色列表' })
  @Perm('system:role:list')
  async list(@Query() query: ListRoleQueryDto) {
    return await this.roleService.list(query);
  }

  @Get('all')
  @ApiOperation({ summary: '所有角色（下拉用）' })
  @Public()
  async all() {
    const roles = await this.roleService.list({ page: 1, pageSize: 500 } as any);
    return roles.items.map((r) => ({ id: r.id, name: r.name, code: r.code }));
  }

  @Get(':id')
  @ApiOperation({ summary: '角色详情' })
  @Perm('system:role:detail')
  async detail(@IdParam() id: number) {
    return await this.roleService.detail(id);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '创建角色' })
  @Perm('system:role:create')
  async create(@Body() dto: CreateRoleDto) {
    return await this.roleService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  @Perm('system:role:update')
  async update(@IdParam() id: number, @Body() dto: UpdateRoleDto) {
    return await this.roleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @Perm('system:role:delete')
  async remove(@IdParam() id: number) {
    return await this.roleService.remove(id);
  }

  @Post(':id/menus')
  @HttpCode(200)
  @ApiOperation({ summary: '分配菜单' })
  @Perm('system:role:assign-menu')
  async assignMenus(@IdParam() id: number, @Body() dto: AssignMenusDto) {
    return await this.roleService.assignMenus(id, dto);
  }
}
