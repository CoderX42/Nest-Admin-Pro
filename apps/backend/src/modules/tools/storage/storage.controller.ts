import {
  Controller,
  Post,
  Delete,
  Get,
  HttpCode,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';

import { Perm } from '@/common/decorators/perm.decorator';
import { IdParam } from '@/common/decorators/id-param.decorator';
import { OperLog } from '@/common/decorators/oper-log.decorator';
import { CurrentUser, IAuthUser } from '@/common/decorators/current-user.decorator';

import { StorageService } from './storage.service';
import { ListStorageQueryDto } from './dto/list-storage.dto';
import { ErrorEnum } from '@/constants/error.enum';
import { BusinessException } from '@/common/exceptions/business.exception';

@ApiTags('Tools - 文件存储')
@ApiBearerAuth()
@Controller('tools/storage')
export class StorageController {
  constructor(private readonly service: StorageService) {}

  @Post('upload')
  @HttpCode(200)
  @ApiOperation({ summary: '上传文件（multipart/form-data, field=file）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        driver: { type: 'string', enum: ['local', 'qiniu'], description: '可选，缺省走 app.storageDriver' },
      },
      required: ['file'],
    },
  })
  @Perm('tools:storage:upload')
  @OperLog({ module: '文件存储', action: '上传', saveParams: false })
  async upload(
    @Req() req: FastifyRequest,
    @CurrentUser() user: IAuthUser,
  ) {
    const saved = await this.service.upload(req, user.uid);
    return saved;
  }

  @Get()
  @ApiOperation({ summary: '文件列表' })
  @Perm('tools:storage:list')
  async list(@Query() query: ListStorageQueryDto) {
    return await this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '文件详情' })
  @Perm('tools:storage:list')
  async detail(@IdParam() id: number) {
    const s = await this.service.detail(id);
    if (!s) throw new BusinessException(ErrorEnum.FILE_NOT_FOUND);
    return s;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文件（同步清理底层存储）' })
  @Perm('tools:storage:remove')
  @OperLog({ module: '文件存储', action: '删除' })
  async remove(@IdParam() id: number, @CurrentUser() user: IAuthUser) {
    return await this.service.remove(id, user.uid);
  }
}
