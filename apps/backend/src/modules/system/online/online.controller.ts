import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Perm } from '@/common/decorators/perm.decorator';
import { IdParam } from '@/common/decorators/id-param.decorator';
import { OperLog } from '@/common/decorators/oper-log.decorator';
import { CurrentUser, IAuthUser } from '@/common/decorators/current-user.decorator';

import { OnlineService } from './online.service';
import { ListOnlineQueryDto } from './dto/online.dto';
import { KickBatchDto } from './dto/kick-batch.dto';

@ApiTags('System - 在线用户')
@ApiBearerAuth()
@Controller('monitor/online')
export class OnlineController {
  constructor(private readonly online: OnlineService) {}

  @Get()
  @ApiOperation({ summary: '在线用户列表（基于 Redis）' })
  @Perm('monitor:online:list')
  async list(@Query() query: ListOnlineQueryDto) {
    const { items, total } = await this.online.list(query);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const safeItems = items;
    const start = (page - 1) * pageSize;
    const pagedItems = safeItems.slice(start, start + pageSize);
    return {
      items: pagedItems,
      meta: {
        itemCount: pagedItems.length,
        totalItems: total,
        itemsPerPage: pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        currentPage: page,
      },
    };
  }

  @Delete(':uid')
  @ApiOperation({ summary: '强制下线（踢人）' })
  @Perm('monitor:online:kick')
  @OperLog({ module: '在线用户', action: '强制下线' })
  async kick(
    @IdParam('uid') uid: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return await this.online.kick(uid, user.uid);
  }

  @Post('kick-batch')
  @HttpCode(200)
  @ApiOperation({ summary: '批量强制下线' })
  @Perm('monitor:online:kick')
  @OperLog({ module: '在线用户', action: '批量强制下线', saveParams: false })
  async kickBatch(
    @Body() dto: KickBatchDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return await this.online.kickBatch(dto.uids, user.uid);
  }
}
