import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async list(query: QueryPostDto) {
    const { name, code, status, page = 1, limit = 10 } = query;
    const where: any = { deletedAt: null };
    if (name) where.name = { contains: name };
    if (code) where.code = { contains: code };
    if (status !== undefined) where.status = status;
    const [total, items] = await Promise.all([
      this.prisma.sysPost.count({ where }),
      this.prisma.sysPost.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { sort: 'asc' } }),
    ]);
    return { total, items };
  }

  async findOne(id: number) {
    const post = await this.prisma.sysPost.findFirst({ where: { id, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(dto: CreatePostDto) {
    const existing = await this.prisma.sysPost.findFirst({
      where: { code: dto.code, tenantId: null, deletedAt: null },
    });
    if (existing) throw new BadRequestException('Post code already exists');
    return this.prisma.sysPost.create({ data: { tenantId: null, name: dto.name, code: dto.code, sort: dto.sort ?? 0, status: dto.status ?? 1, remark: dto.remark } });
  }

  async update(dto: UpdatePostDto) {
    const post = await this.prisma.sysPost.findFirst({ where: { id: dto.id, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');
    if (dto.code && dto.code !== post.code) {
      const existing = await this.prisma.sysPost.findFirst({
        where: { code: dto.code, tenantId: null, deletedAt: null },
      });
      if (existing) throw new BadRequestException('Post code already exists');
    }
    return this.prisma.sysPost.update({ where: { id: dto.id }, data: { name: dto.name, code: dto.code, sort: dto.sort, status: dto.status, remark: dto.remark } });
  }

  async remove(id: number) {
    await this.prisma.sysPost.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }
}
