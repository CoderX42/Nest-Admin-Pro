import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, Get, Param, Res, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { Public } from '../../auth/guards';
import type { Multer } from 'multer';

@ApiTags('File Management')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  async upload(@UploadedFile() file: Multer.File) {
    return this.fileService.upload(file);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @ApiOperation({ summary: 'Upload image' })
  async uploadImage(@UploadedFile() file: Multer.File) {
    return this.fileService.uploadImage(file);
  }

  @Public()
  @Get(':filename')
  @ApiOperation({ summary: 'Preview/download file' })
  async preview(@Param('filename') filename: string, @Res() res: any) {
    return this.fileService.preview(filename, res);
  }
}