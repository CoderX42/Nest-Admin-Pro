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
import { CurrentUser, IAuthUser } from '@/common/decorators/current-user.decorator';
import { OperLog } from '@/common/decorators/oper-log.decorator';

import { UserService } from './user.service';
import {
  AssignRolesDto,
  CreateUserDto,
  ListUserQueryDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto/user.dto';

@ApiTags('System - 用户管理')
@ApiBearerAuth()
@Controller('system/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '用户列表' })
  @Perm('system:user:list')
  async list(@Query() query: ListUserQueryDto) {
    return await this.userService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '用户详情' })
  @Perm('system:user:detail')
  async detail(@IdParam() id: number) {
    return await this.userService.detail(id);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '创建用户' })
  @Perm('system:user:create')
  @OperLog({ module: '用户管理', action: '创建用户' })
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  @Perm('system:user:update')
  @OperLog({ module: '用户管理', action: '更新用户' })
  async update(@IdParam() id: number, @Body() dto: UpdateUserDto) {
    return await this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @Perm('system:user:delete')
  @OperLog({ module: '用户管理', action: '删除用户' })
  async remove(@IdParam() id: number, @CurrentUser() user: IAuthUser) {
    return await this.userService.remove(id, user.uid);
  }

  @Post(':id/roles')
  @HttpCode(200)
  @ApiOperation({ summary: '分配角色' })
  @Perm('system:user:assign-role')
  @OperLog({ module: '用户管理', action: '分配角色' })
  async assignRoles(@IdParam() id: number, @Body() dto: AssignRolesDto) {
    return await this.userService.assignRoles(id, dto);
  }

  @Post(':id/reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: '重置密码' })
  @Perm('system:user:reset-password')
  @OperLog({ module: '用户管理', action: '重置密码' })
  async resetPassword(@IdParam() id: number, @Body() dto: ResetPasswordDto) {
    return await this.userService.resetPassword(id, dto);
  }
}
