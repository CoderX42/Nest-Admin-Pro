import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeptService } from './dept.service';
import { CreateDeptDto, UpdateDeptDto, QueryDeptDto } from './dto/dept.dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('System - Department')
@Controller('system/dept')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @Get('list')
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: 'Get department tree' })
  async list(@Query() query: QueryDeptDto) {
    return this.deptService.list(query);
  }

  @Get('tree')
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: 'Get department tree structure' })
  async tree() {
    return this.deptService.tree();
  }

  @Get(':id')
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: 'Get department by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deptService.findOne(id);
  }

  @Post()
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: 'Create department' })
  async create(@Body() dto: CreateDeptDto) {
    return this.deptService.create(dto);
  }

  @Put()
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: 'Update department' })
  async update(@Body() dto: UpdateDeptDto) {
    return this.deptService.update(dto);
  }

  @Delete(':id')
  @RequirePermission('system:dept:list')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete department' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.deptService.remove(id);
  }
}
