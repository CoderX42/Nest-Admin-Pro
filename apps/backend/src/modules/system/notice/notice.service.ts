import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateNoticeDto, UpdateNoticeDto, QueryNoticeDto } from './dto/notice.dto';

@Injectable()
export class NoticeService {
  constructor(private prisma: PrismaService) {}

  async list(query: QueryNoticeDto) {
    const { title, type, status, page = 1, limit = 10 } = query;
    const where: any = { deletedAt: null };
    if (title) where.title = { contains: title };
    if (type !== undefined) where.type = type;
    if (status !== undefined) where.status = status;
    const [total, items] = await Promise.all([
      this.prisma.sysNotice.count({ where }),
      this.prisma.sysNotice.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' } }),
    ]);
    return { total, items };
  }

  async findOne(id: number) {
    const notice = await this.prisma.sysNotice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  async create(dto: CreateNoticeDto) {
    return this.prisma.sysNotice.create({
      data: { title: dto.title, content: dto.content, type: dto.type ?? 1, status: dto.status ?? 1, publishAt: dto.publishTime },
    });
  }

  async update(dto: UpdateNoticeDto) {
    const notice = await this.prisma.sysNotice.findUnique({ where: { id: dto.id } });
    if (!notice) throw new NotFoundException('Notice not found');
    return this.prisma.sysNotice.update({ where: { id: dto.id }, data: { title: dto.title, content: dto.content, type: dto.type, status: dto.status, publishAt: dto.publishTime } });
  }

  async remove(id: number) {
    await this.prisma.sysNotice.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }
}
