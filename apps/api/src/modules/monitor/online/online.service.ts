import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../cache/redis.service';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class OnlineService {
  constructor(private redis: RedisService, private prisma: PrismaService) {}

  async list() {
    const tokens = await this.redis.getOnlineUsers();
    const users: any[] = [];
    for (const token of tokens) {
      const userId = await this.redis.getOnlineUser(token);
      if (userId) {
        const user = await this.prisma.sysUser.findUnique({
          where: { id: parseInt(userId) },
          select: { id: true, username: true, nickname: true, avatar: true, email: true, phone: true, lastLoginTime: true },
        });
        if (user) {
          users.push({ token, ...user });
        }
      }
    }
    return users;
  }

  async forceLogout(token: string) {
    await this.redis.removeOnlineUser(token);
    return { success: true };
  }
}