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

import { DeptService } from './dept.service';
import { CreateDeptDto, ListDeptQueryDto, UpdateDeptDto } from './dto/dept.dto';

@ApiTags('System - 部门管理')
@ApiBearerAuth()
@Controller('system/depts')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @Get()
  @ApiOperation({ summary: '部门列表（默认树形，format=list 时扁平）' })
  @Perm('system:dept:list')
  async list(@Query() query: ListDeptQueryDto) {
    return await this.deptService.list(query);
  }

  @Get('all')
  @ApiOperation({ summary: '全部部门（下拉用）' })
  @Public()
  async all() {
    return await this.deptService.list({ format: 'list' });
  }

  @Get(':id')
  @ApiOperation({ summary: '部门详情' })
  @Perm('system:dept:detail')
  async detail(@IdParam() id: number) {
    return await this.deptService.detail(id);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '创建部门' })
  @Perm('system:dept:create')
  async create(@Body() dto: CreateDeptDto) {
    return await this.deptService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新部门（移动父节点会自动级联 path）' })
  @Perm('system:dept:update')
  async update(@IdParam() id: number, @Body() dto: UpdateDeptDto) {
    return await this.deptService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @Perm('system:dept:delete')
  async remove(@IdParam() id: number) {
    return await this.deptService.remove(id);
  }
}
