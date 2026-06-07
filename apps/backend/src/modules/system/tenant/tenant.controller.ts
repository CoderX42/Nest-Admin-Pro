import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionGuard, RequirePermission } from '../../../auth/guards';
import { CreateTenantDto, QueryTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { TenantService } from './tenant.service';

@ApiTags('System - Tenant Management')
@Controller('system/tenant')
@UseGuards(PermissionGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('list')
  @RequirePermission('system:tenant:list')
  @ApiOperation({ summary: 'Get tenant list' })
  async list(@Query() query: QueryTenantDto) {
    return this.tenantService.list(query);
  }

  @Get(':id')
  @RequirePermission('system:tenant:query')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantService.findOne(id);
  }

  @Post()
  @RequirePermission('system:tenant:add')
  @ApiOperation({ summary: 'Create tenant' })
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto);
  }

  @Put()
  @RequirePermission('system:tenant:edit')
  @ApiOperation({ summary: 'Update tenant' })
  async update(@Body() dto: UpdateTenantDto) {
    return this.tenantService.update(dto);
  }

  @Delete(':id')
  @RequirePermission('system:tenant:remove')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete tenant' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tenantService.remove(id);
  }
}
