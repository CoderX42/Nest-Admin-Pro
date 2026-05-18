import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwtSecret') || 'default-secret',
    });
  }

  async validate(payload: { sub: number; username: string }) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id: payload.sub },
      include: { roles: true, dept: true },
    });

    if (!user || user.status !== 1 || user.isDelete === 1) {
      throw new UnauthorizedException('User not found or disabled');
    }

    const permissions = await this.extractPermissions(user.roles);

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      deptId: user.deptId,
      roles: user.roles.map((r) => ({ id: r.id, code: r.code, name: r.name })),
      permissions,
    };
  }

  private async extractPermissions(roles: any[]): Promise<string[]> {
    if (roles.some((role) => role.code === 'SUPER_ADMIN')) {
      const menus = await this.prisma.sysMenu.findMany({
        where: { status: 1, perms: { not: '' } },
        select: { perms: true },
      });
      return menus.map((menu) => menu.perms).filter(Boolean) as string[];
    }

    const menuIds = new Set<number>();
    for (const role of roles) {
      try {
        const ids = JSON.parse(role.menuIds || '[]');
        if (Array.isArray(ids)) {
          ids.forEach((id) => {
            const num = Number(id);
            if (Number.isFinite(num)) menuIds.add(num);
          });
        }
      } catch {
        // ignore
      }
    }

    if (!menuIds.size) return [];

    const menus = await this.prisma.sysMenu.findMany({
      where: { id: { in: Array.from(menuIds).map(BigInt) }, status: 1, perms: { not: '' } },
      select: { perms: true },
    });
    return [...new Set(menus.map((menu) => menu.perms).filter(Boolean) as string[])];
  }
}
