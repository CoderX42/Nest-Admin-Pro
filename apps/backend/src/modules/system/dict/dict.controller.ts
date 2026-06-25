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

import { DictService } from './dict.service';
import {
  CreateDictItemDto,
  CreateDictTypeDto,
  ListDictItemQueryDto,
  ListDictTypeQueryDto,
  UpdateDictItemDto,
  UpdateDictTypeDto,
} from './dto/dict.dto';

@ApiTags('System - 字典管理')
@ApiBearerAuth()
@Controller('system/dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  // ===== 类型 =====

  @Get('types')
  @ApiOperation({ summary: '字典类型列表' })
  @Perm('system:dict-type:list')
  async listTypes(@Query() query: ListDictTypeQueryDto) {
    return await this.dictService.listTypes(query);
  }

  @Get('types/all')
  @ApiOperation({ summary: '所有字典类型（下拉用）' })
  @Public()
  async allTypes() {
    return await this.dictService.allTypes();
  }

  @Get('types/:id')
  @ApiOperation({ summary: '字典类型详情' })
  @Perm('system:dict-type:detail')
  async detailType(@IdParam() id: number) {
    return await this.dictService.detailType(id);
  }

  @Post('types')
  @HttpCode(200)
  @ApiOperation({ summary: '创建字典类型' })
  @Perm('system:dict-type:create')
  async createType(@Body() dto: CreateDictTypeDto) {
    return await this.dictService.createType(dto);
  }

  @Patch('types/:id')
  @ApiOperation({ summary: '更新字典类型' })
  @Perm('system:dict-type:update')
  async updateType(@IdParam() id: number, @Body() dto: UpdateDictTypeDto) {
    return await this.dictService.updateType(id, dto);
  }

  @Delete('types/:id')
  @ApiOperation({ summary: '删除字典类型' })
  @Perm('system:dict-type:delete')
  async removeType(@IdParam() id: number) {
    return await this.dictService.removeType(id);
  }

  // ===== 字典项 =====

  @Get('items')
  @ApiOperation({ summary: '字典项列表（按 typeCode）' })
  @Perm('system:dict-item:list')
  async listItems(@Query() query: ListDictItemQueryDto) {
    return await this.dictService.listItems(query);
  }

  @Get('items/by-type/:typeCode')
  @ApiOperation({ summary: '按 typeCode 取启用字典项（下拉用）' })
  @Public()
  async itemsByTypeCode(@Param('typeCode') typeCode: string) {
    return await this.dictService.itemsByTypeCode(typeCode);
  }

  @Get('items/:id')
  @ApiOperation({ summary: '字典项详情' })
  @Perm('system:dict-item:detail')
  async detailItem(@IdParam() id: number) {
    return await this.dictService.detailItem(id);
  }

  @Post('items')
  @HttpCode(200)
  @ApiOperation({ summary: '创建字典项' })
  @Perm('system:dict-item:create')
  async createItem(@Body() dto: CreateDictItemDto) {
    return await this.dictService.createItem(dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: '更新字典项' })
  @Perm('system:dict-item:update')
  async updateItem(@IdParam() id: number, @Body() dto: UpdateDictItemDto) {
    return await this.dictService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '删除字典项' })
  @Perm('system:dict-item:delete')
  async removeItem(@IdParam() id: number) {
    return await this.dictService.removeItem(id);
  }
}
