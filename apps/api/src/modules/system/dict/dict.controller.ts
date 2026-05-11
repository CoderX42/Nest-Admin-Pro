import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DictService } from './dict.service';
import { CreateDictTypeDto, UpdateDictTypeDto, QueryDictTypeDto, CreateDictDataDto, UpdateDictDataDto } from './dto/dict.dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';

@ApiTags('System - Dictionary')
@Controller('system/dict')
@UseGuards(JwtAuthGuard)
export class DictController {
  constructor(private readonly dictService: DictService) {}

  // Dict Type
  @Get('type/list')
  @ApiOperation({ summary: 'Get dict type list' })
  async typeList(@Query() query: QueryDictTypeDto) {
    return this.dictService.typeList(query);
  }

  @Get('type/:id')
  @ApiOperation({ summary: 'Get dict type by ID' })
  async typeFindOne(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.typeFindOne(id);
  }

  @Post('type')
  @ApiOperation({ summary: 'Create dict type' })
  async typeCreate(@Body() dto: CreateDictTypeDto) {
    return this.dictService.typeCreate(dto);
  }

  @Put('type')
  @ApiOperation({ summary: 'Update dict type' })
  async typeUpdate(@Body() dto: UpdateDictTypeDto) {
    return this.dictService.typeUpdate(dto);
  }

  @Delete('type/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete dict type' })
  async typeRemove(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.typeRemove(id);
  }

  // Dict Data
  @Get('data/list')
  @ApiOperation({ summary: 'Get dict data list' })
  async dataList(@Query('dictTypeId') dictTypeId: number) {
    return this.dictService.dataList(dictTypeId);
  }

  @Post('data')
  @ApiOperation({ summary: 'Create dict data' })
  async dataCreate(@Body() dto: CreateDictDataDto) {
    return this.dictService.dataCreate(dto);
  }

  @Put('data')
  @ApiOperation({ summary: 'Update dict data' })
  async dataUpdate(@Body() dto: UpdateDictDataDto) {
    return this.dictService.dataUpdate(dto);
  }

  @Delete('data/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete dict data' })
  async dataRemove(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.dataRemove(id);
  }
}