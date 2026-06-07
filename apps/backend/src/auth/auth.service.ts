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
import { JwtPayloadDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
  ) {}

  async login(dto: LoginDto) {
    const valid = await this.validateCaptcha(dto.captchaKey, dto.captchaText);
    if (!valid) {
      throw new BadRequestException('Invalid or expired captcha');
    }

    const user = await this.findActiveUserByUsername(dto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
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

    const payload: JwtPayloadDto = {
      sub: String(user.id),
      username: user.username,
      tenantId: user.tenantId === null ? null : String(user.tenantId),
      isPlatformAdmin: user.isPlatformAdmin === 1,
    };
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
        roles: this.flattenRoles(user).map((r) => r.name),
      },
    };
  }

  async register(data: { username: string; password: string; nickname?: string }) {
    const existing = await this.prisma.sysUser.findFirst({
      where: { username: data.username, deletedAt: null },
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
    const user = await this.prisma.sysUser.findFirst({
      where: { id: userId, deletedAt: null },
      include: { userRoles: { include: { role: { include: { roleMenus: true } } } }, dept: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roles = this.flattenRoles(user);
    const isSuperAdmin = user.isPlatformAdmin === 1 || roles.some((role) => role.code === 'platform_admin');
    const roleMenuIds = this.extractMenuIds(user.userRoles);

    const grantedMenus = await this.prisma.sysMenu.findMany({
      where: isSuperAdmin
        ? { status: 1 }
        : { id: { in: roleMenuIds.map(BigInt) }, status: 1 },
      orderBy: { sort: 'asc' },
    });

    // Build nested tree structure
    type RouteMenu = (typeof grantedMenus)[number] & { children: RouteMenu[] };
    const menuMap = new Map<number, RouteMenu>();
    const rootMenus: RouteMenu[] = [];
    const routeMenus = grantedMenus.filter((m) => m.type !== 3 && m.isVisible === 1);
    routeMenus.forEach((m) => {
      menuMap.set(Number(m.id), { ...m, children: [] });
    });
    routeMenus.forEach((m) => {
      const menu = menuMap.get(Number(m.id))!;
      if (Number(m.parentId) === 0) {
        rootMenus.push(menu);
      } else {
        const parent = menuMap.get(Number(m.parentId));
        if (parent) {
          parent.children.push(menu);
        }
      }
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
        roles: roles.map((r) => r.name),
      },
      permissions: grantedMenus.map((m) => m.perms).filter(Boolean),
      menus: rootMenus,
    };
  }

  private extractMenuIds(
    userRoles: { role: { roleMenus: { menuId: bigint }[] } }[],
  ) {
    return [
      ...new Set(
        userRoles.flatMap((userRole) =>
          userRole.role.roleMenus.map((roleMenu) => Number(roleMenu.menuId)),
        ),
      ),
    ];
  }

  async getOnlineUsers() {
    return this.redis.getOnlineUsers();
  }

  async getProfile(userId: number) {
    const user = await this.prisma.sysUser.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        userRoles: { include: { role: true } },
        userPosts: { include: { post: true } },
        dept: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roles = this.flattenRoles(user);
    const posts = user.userPosts.map((userPost) => userPost.post);

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      remark: user.remark,
      status: user.status,
      deptName: user.dept?.name,
      roles: roles.map((r) => ({ id: r.id, name: r.name, code: r.code })),
      posts: posts.map((p) => ({ id: p.id, name: p.name })),
    };
  }

  async updateProfile(userId: number, dto: { nickname?: string; email?: string; phone?: string; avatar?: string; remark?: string }) {
    const data: any = {};
    if (dto.nickname !== undefined) data.nickname = dto.nickname;
    if (dto.email !== undefined) data.email = dto.email || null;
    if (dto.phone !== undefined) data.phone = dto.phone || null;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;
    if (dto.remark !== undefined) data.remark = dto.remark || null;

    const user = await this.prisma.sysUser.update({
      where: { id: userId },
      data,
      include: { userRoles: { include: { role: true } }, dept: true },
    });
    const roles = this.flattenRoles(user);

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      remark: user.remark,
      deptName: user.dept?.name,
      roles: roles.map((r) => r.name),
    };
  }

  async updatePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.sysUser.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return ApiResponse.success(null, 'Password updated successfully');
  }

  private findActiveUserByUsername(username: string) {
    return this.prisma.sysUser.findFirst({
      where: { username, deletedAt: null },
      include: { userRoles: { include: { role: { include: { roleMenus: true } } } }, dept: true },
    });
  }

  private flattenRoles(user: { userRoles: { role: { id: bigint; name: string; code: string } }[] }) {
    return user.userRoles.map((userRole) => userRole.role);
  }
}
