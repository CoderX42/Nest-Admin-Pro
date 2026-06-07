import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto/user.dto';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';

@ApiTags('System - User Management')
@Controller('system/user')
@UseGuards(PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @RequirePermission('system:user:list')
  @ApiOperation({ summary: 'Get user list' })
  async list(@Query() query: QueryUserDto) {
    return this.userService.list(query);
  }

  @Get(':id')
  @RequirePermission('system:user:query')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @RequirePermission('system:user:add')
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put()
  @RequirePermission('system:user:edit')
  @ApiOperation({ summary: 'Update user' })
  async update(@Body() dto: UpdateUserDto) {
    return this.userService.update(dto);
  }

  @Delete(':id')
  @RequirePermission('system:user:remove')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Put('reset-password/:id')
  @RequirePermission('system:user:resetPwd')
  @ApiOperation({ summary: 'Reset user password' })
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.userService.resetPassword(id);
  }

  @Put('change-status/:id')
  @RequirePermission('system:user:edit')
  @ApiOperation({ summary: 'Change user status' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.userService.changeStatus(id, status);
  }

  @Put('assign-roles/:id')
  @RequirePermission('system:user:assignRole')
  @ApiOperation({ summary: 'Assign roles to user' })
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleIds') roleIds: number[],
  ) {
    return this.userService.assignRoles(id, roleIds);
  }
}
