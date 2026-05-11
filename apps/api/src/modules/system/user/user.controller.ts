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
import { Public, RequirePermission } from '../../../auth/guards';
import { JwtAuthGuard } from '../../../auth/jwt.guard';

@ApiTags('System - User Management')
@Controller('system/user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get user list' })
  async list(@Query() query: QueryUserDto) {
    return this.userService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put()
  @ApiOperation({ summary: 'Update user' })
  async update(@Body() dto: UpdateUserDto) {
    return this.userService.update(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Put('reset-password/:id')
  @ApiOperation({ summary: 'Reset user password' })
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.userService.resetPassword(id);
  }

  @Put('change-status/:id')
  @ApiOperation({ summary: 'Change user status' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.userService.changeStatus(id, status);
  }

  @Put('assign-roles/:id')
  @ApiOperation({ summary: 'Assign roles to user' })
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleIds') roleIds: number[],
  ) {
    return this.userService.assignRoles(id, roleIds);
  }
}