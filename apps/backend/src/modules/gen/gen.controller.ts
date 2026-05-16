import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GenService } from './gen.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';

@ApiTags('Code Generator')
@Controller('gen')
@UseGuards(JwtAuthGuard)
export class GenController {
  constructor(private readonly genService: GenService) {}

  @Get('table/list')
  @ApiOperation({ summary: 'Get generated table list' })
  async tableList(@Query() query: any) {
    return this.genService.tableList(query);
  }

  @Get('table/:id')
  @ApiOperation({ summary: 'Get table by ID' })
  async tableFindOne(@Param('id', ParseIntPipe) id: number) {
    return this.genService.tableFindOne(id);
  }

  @Post('table')
  @ApiOperation({ summary: 'Create table config' })
  async tableCreate(@Body() dto: any) {
    return this.genService.tableCreate(dto);
  }

  @Put('table')
  @ApiOperation({ summary: 'Update table config' })
  async tableUpdate(@Body() dto: any) {
    return this.genService.tableUpdate(dto);
  }

  @Delete('table/:id')
  @ApiOperation({ summary: 'Delete table config' })
  async tableDelete(@Param('id', ParseIntPipe) id: number) {
    return this.genService.tableDelete(id);
  }

  @Get('column/:tableId')
  @ApiOperation({ summary: 'Get columns by table ID' })
  async columnList(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.genService.columnList(tableId);
  }

  @Post('column/sync')
  @ApiOperation({ summary: 'Sync columns from database' })
  async columnSync(@Body('tableId') tableId: number) {
    return this.genService.syncColumns(tableId);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate code' })
  async generate(@Body('tableId') tableId: number) {
    return this.genService.generate(tableId);
  }

  @Get('preview/:tableId')
  @ApiOperation({ summary: 'Preview generated code' })
  async preview(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.genService.preview(tableId);
  }
}