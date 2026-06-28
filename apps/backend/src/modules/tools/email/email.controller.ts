import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Perm } from '@/common/decorators/perm.decorator';
import { IdParam } from '@/common/decorators/id-param.decorator';
import { OperLog } from '@/common/decorators/oper-log.decorator';
import { CurrentUser, IAuthUser } from '@/common/decorators/current-user.decorator';

import { MailService } from './email.service';
import { SendMailDto } from './dto/mail.dto';
import { ErrorEnum } from '@/constants/error.enum';
import { BusinessException } from '@/common/exceptions/business.exception';

@ApiTags('Tools - 邮件发送')
@ApiBearerAuth()
@Controller('tools/email')
export class EmailController {
  constructor(private readonly service: MailService) {}

  @Post('send')
  @HttpCode(200)
  @ApiOperation({ summary: '发送邮件（同步落库）' })
  @Perm('tools:email:send')
  @OperLog({ module: '邮件发送', action: '发送' })
  async send(@Body() dto: SendMailDto, @CurrentUser() user: IAuthUser) {
    return await this.service.send(dto, user.uid, user.username ?? '');
  }

  @Get('log')
  @ApiOperation({ summary: '邮件发送日志' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'status', required: false, description: '0=待发 1=成功 2=失败' })
  @Perm('tools:email:list')
  async logs(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('keyword') keyword?: string,
    @Query('status') status?: number,
  ) {
    return await this.service.list({ page, pageSize, keyword, status });
  }

  @Get('log/:id')
  @ApiOperation({ summary: '邮件日志详情' })
  @Perm('tools:email:list')
  async detail(@IdParam() id: number) {
    const m = await this.service.detail(id);
    if (!m) throw new BusinessException(ErrorEnum.MAIL_SEND_FAILED, '邮件日志不存在');
    return m;
  }

  @Delete('log/:id')
  @ApiOperation({ summary: '删除邮件日志' })
  @Perm('tools:email:remove')
  @OperLog({ module: '邮件发送', action: '删除' })
  async remove(@IdParam() id: number) {
    return await this.service.remove(id);
  }
}
