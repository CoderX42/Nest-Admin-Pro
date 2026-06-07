import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class OperLogService {
  constructor(private prisma: PrismaService) {}

  async list(query: { page?: number; limit?: number; username?: string; module?: string }) {
    const { page = 1, limit = 10, username, module } = query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const where: any = {};
    if (username) where.username = { contains: username };
    if (module) where.module = { contains: module };
    const [total, items] = await Promise.all([
      this.prisma.sysOperLog.count({ where }),
      this.prisma.sysOperLog.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum, take: limitNum,
      }),
    ]);
    return { total, items };
  }

  async findOne(id: number) {
    return this.prisma.sysOperLog.findUnique({ where: { id } });
  }

  async clean() {
    await this.prisma.sysOperLog.deleteMany({});
    return { success: true };
  }
}
