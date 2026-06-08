import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, AssignPermDto, SetDataScopeDto } from './dto/role.dto';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('System - Role Management')
@Controller('system/role')
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('list')
  @RequirePermission('system:role:list')
  @ApiOperation({ summary: 'Get role list' })
  async list(@Query() query: QueryRoleDto) {
    return this.roleService.list(query);
  }

  @Post()
  @RequirePermission('system:role:add')
  @ApiOperation({ summary: 'Create role' })
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Put()
  @RequirePermission('system:role:edit')
  @ApiOperation({ summary: 'Update role' })
  async update(@Body() dto: UpdateRoleDto) {
    return this.roleService.update(dto);
  }

  @Delete(':id')
  @RequirePermission('system:role:remove')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete role' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }

  @Put('change-status/:id')
  @RequirePermission('system:role:edit')
  @ApiOperation({ summary: 'Change role status' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.roleService.changeStatus(id, status);
  }

  @Put('assign-permissions/:id')
  @RequirePermission('system:role:assignMenu')
  @ApiOperation({ summary: 'Assign permissions to role' })
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermDto,
  ) {
    return this.roleService.assignPermissions(id, dto.menuIds, dto.deptIds);
  }

  @Put('set-data-scope/:id')
  @RequirePermission('system:role:setDataScope')
  @ApiOperation({ summary: 'Set role data scope' })
  async setDataScope(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetDataScopeDto,
  ) {
    return this.roleService.setDataScope(id, dto);
  }

  @Get('menu/:id')
  @RequirePermission('system:role:query')
  @ApiOperation({ summary: 'Get role menu IDs' })
  async getRoleMenus(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.getRoleMenus(id);
  }

  @Get(':id')
  @RequirePermission('system:role:query')
  @ApiOperation({ summary: 'Get role by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }
}
