import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { Multer } from 'multer';

@Injectable()
export class FileService {
  private uploadDir = process.env.UPLOAD_DIR || './uploads';
  private maxImageSize = parseInt(process.env.MAX_IMAGE_SIZE || '2097152', 10);
  private maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '104857600', 10);

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const url = `/file/${file.filename}`;
    return { url, filename: file.originalname, size: file.size };
  }

  async uploadImage(file: Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const ext = path.extname(file.originalname).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    if (!imageExts.includes(ext)) throw new BadRequestException('Only image files are allowed');
    if (file.size > this.maxImageSize) throw new BadRequestException(`Image size must be less than ${this.maxImageSize / 1024 / 1024}MB`);
    const url = `/file/${file.filename}`;
    return { url, filename: file.originalname, size: file.size };
  }

  preview(filename: string, res: any) {
    const filePath = path.join(this.uploadDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }
    return res.sendFile(filePath);
  }
}