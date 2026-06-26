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

import { ParamConfigService } from './param-config.service';
import {
  CreateParamConfigDto,
  ListParamConfigQueryDto,
  UpdateParamConfigDto,
} from './dto/param-config.dto';

@ApiTags('System - 参数配置')
@ApiBearerAuth()
@Controller('system/params')
export class ParamConfigController {
  constructor(private readonly service: ParamConfigService) {}

  @Get()
  @ApiOperation({ summary: '参数列表' })
  @Perm('system:param-config:list')
  async list(@Query() query: ListParamConfigQueryDto) {
    return await this.service.list(query);
  }

  @Get('by-key/:key')
  @ApiOperation({ summary: '按 key 取参数（公开，供前端启动时拉配置）' })
  @Public()
  async byKey(@Param('key') key: string) {
    return await this.service.byKey(key);
  }

  @Get(':id')
  @ApiOperation({ summary: '参数详情' })
  @Perm('system:param-config:detail')
  async detail(@IdParam() id: number) {
    return await this.service.detail(id);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '创建参数' })
  @Perm('system:param-config:create')
  async create(@Body() dto: CreateParamConfigDto) {
    return await this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新参数' })
  @Perm('system:param-config:update')
  async update(@IdParam() id: number, @Body() dto: UpdateParamConfigDto) {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除参数' })
  @Perm('system:param-config:delete')
  async remove(@IdParam() id: number) {
    return await this.service.remove(id);
  }
}
