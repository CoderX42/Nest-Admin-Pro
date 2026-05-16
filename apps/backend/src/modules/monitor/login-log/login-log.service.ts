import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class LoginLogService {
  constructor(private prisma: PrismaService) {}

  async list(query: { page?: number; limit?: number; username?: string; status?: number }) {
    const { page = 1, limit = 10, username, status } = query;
    const where: any = {};
    if (username) where.username = { contains: username };
    if (status !== undefined) where.status = status;
    const [total, items] = await Promise.all([
      this.prisma.sysLoginLog.count({ where }),
      this.prisma.sysLoginLog.findMany({
        where, orderBy: { createTime: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
    ]);
    return { total, items };
  }

  async findOne(id: number) {
    return this.prisma.sysLoginLog.findUnique({ where: { id } });
  }

  async clean() {
    await this.prisma.sysLoginLog.deleteMany({});
    return { success: true };
  }
}