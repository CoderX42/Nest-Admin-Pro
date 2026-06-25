import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NoticeService } from './notice.service';
import { CreateNoticeDto, UpdateNoticeDto, QueryNoticeDto } from './dto/notice.dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('System - Notice')
@Controller('system/notice')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get('list')
  @RequirePermission('system:notice:list')
  @ApiOperation({ summary: 'Get notice list' })
  async list(@Query() query: QueryNoticeDto) {
    return this.noticeService.list(query);
  }

  @Get(':id')
  @RequirePermission('system:notice:list')
  @ApiOperation({ summary: 'Get notice by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.findOne(id);
  }

  @Post()
  @RequirePermission('system:notice:add')
  @ApiOperation({ summary: 'Create notice' })
  async create(@Body() dto: CreateNoticeDto) {
    return this.noticeService.create(dto);
  }

  @Put()
  @RequirePermission('system:notice:edit')
  @ApiOperation({ summary: 'Update notice' })
  async update(@Body() dto: UpdateNoticeDto) {
    return this.noticeService.update(dto);
  }

  @Delete(':id')
  @RequirePermission('system:notice:remove')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete notice' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.remove(id);
  }
}