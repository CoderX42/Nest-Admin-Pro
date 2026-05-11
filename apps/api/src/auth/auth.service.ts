import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../cache/redis.service';
import * as bcrypt from 'bcryptjs';
import * as svgCaptcha from 'svg-captcha';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.sysUser.findUnique({
      where: { username },
      include: { roles: true, dept: true },
    });

    if (!user || user.isDelete === 1) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.prisma.sysLoginLog.create({
        data: {
          userId: user.id,
          username: user.username,
          ip: 'unknown',
          status: 0,
          msg: 'Password mismatch',
        },
      });
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);
    await this.redis.setOnlineUser(token, String(user.id));

    await this.prisma.sysLoginLog.create({
      data: {
        userId: user.id,
        username: user.username,
        ip: '127.0.0.1',
        status: 1,
        msg: 'Login successful',
      },
    });

    return {
      token,
      userInfo: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
        deptName: user.dept?.name,
        roles: user.roles.map((r) => r.name),
      },
    };
  }

  async register(data: { username: string; password: string; nickname?: string }) {
    const existing = await this.prisma.sysUser.findUnique({
      where: { username: data.username },
    });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.sysUser.create({
      data: {
        username: data.username,
        password: hashedPassword,
        nickname: data.nickname || data.username,
      },
    });
    return { id: user.id, username: user.username };
  }

  async getCaptcha() {
    const captcha = svgCaptcha.create({
      width: 100,
      height: 40,
      fontSize: 40,
      background: '#f0f2f5',
    });
    const key = `captcha:${Date.now()}`;
    await this.redis.set(key, captcha.text, 120);
    return { key, img: captcha.data };
  }

  async validateCaptcha(key: string, text: string): Promise<boolean> {
    const stored = await this.redis.get<string>(key);
    if (!stored || stored.toLowerCase() !== text.toLowerCase()) {
      return false;
    }
    await this.redis.del(key);
    return true;
  }

  async logout(token: string) {
    await this.redis.removeOnlineUser(token);
    return ApiResponse.success(null, 'Logout successful');
  }

  async getUserInfo(userId: number) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
      include: { roles: true, dept: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const allMenuIds = new Set<string>();
    for (const role of user.roles) {
      try {
        const ids = JSON.parse(role.menuIds || '[]');
        ids.forEach((id: string) => allMenuIds.add(id));
      } catch {}
    }

    const menus = await this.prisma.sysMenu.findMany({
      where: { id: { in: Array.from(allMenuIds).map(Number) }, status: 1 },
      orderBy: { sort: 'asc' },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
        deptName: user.dept?.name,
        roles: user.roles.map((r) => r.name),
      },
      permissions: Array.from(allMenuIds),
      menus,
    };
  }

  async getOnlineUsers() {
    return this.redis.getOnlineUsers();
  }
}