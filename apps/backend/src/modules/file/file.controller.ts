import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  ParseIntPipe,
  Res,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { PermissionGuard, Public, RequirePermission } from '../../auth/guards';
import { ApiResponse } from '../../common/api-response';
import type { Multer } from 'multer';

const uploadOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10),
  },
};

@ApiTags('File Management')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('system:config:list')
  @Get('config')
  @ApiOperation({ summary: 'Get file storage config' })
  async getConfig() {
    return this.fileService.getConfig();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('system:config:list')
  @Put('config')
  @ApiOperation({ summary: 'Update file storage config' })
  async updateConfig(@Body() dto: any) {
    return this.fileService.updateConfig(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('system:file:list')
  @Get('list')
  @ApiOperation({ summary: 'Get uploaded file list' })
  async list(@Query() query: any) {
    return this.fileService.list(query);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('system:file:list')
  @Get('detail/:id')
  @ApiOperation({ summary: 'Get uploaded file detail' })
  async detail(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('system:file:remove')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete uploaded file' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  async upload(@UploadedFile() file: Multer.File, @Req() req: any) {
    return this.fileService.upload(file, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('upload-image')
  @ApiOperation({ summary: 'Upload image' })
  async uploadImage(@UploadedFile() file: Multer.File, @Req() req: any) {
    return this.fileService.uploadImage(file, req.user);
  }

  @Public()
  @Get(':filename')
  @ApiOperation({ summary: 'Preview/download file' })
  async preview(@Param('filename') filename: string, @Res() res: any) {
    try {
      await this.fileService.preview(filename, res);
    } catch (e: any) {
      const status = e instanceof HttpException ? e.getStatus() : 500;
      const message = e.message || 'Internal server error';
      res.status(status).json(ApiResponse.error(message, status));
    }
  }
}
