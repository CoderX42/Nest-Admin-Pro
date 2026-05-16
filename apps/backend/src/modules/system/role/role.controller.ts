import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, AssignPermDto } from './dto/role.dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';

@ApiTags('System - Role Management')
@Controller('system/role')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get role list' })
  async list(@Query() query: QueryRoleDto) {
    return this.roleService.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create role' })
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Put()
  @ApiOperation({ summary: 'Update role' })
  async update(@Body() dto: UpdateRoleDto) {
    return this.roleService.update(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete role' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }

  @Put('change-status/:id')
  @ApiOperation({ summary: 'Change role status' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.roleService.changeStatus(id, status);
  }

  @Put('assign-permissions/:id')
  @ApiOperation({ summary: 'Assign permissions to role' })
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermDto,
  ) {
    return this.roleService.assignPermissions(id, dto.menuIds, dto.deptIds);
  }

  @Get('menu/:id')
  @ApiOperation({ summary: 'Get role menu IDs' })
  async getRoleMenus(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.getRoleMenus(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }
}
