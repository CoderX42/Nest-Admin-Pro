import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { setTenantContext } from '../common/middleware/request-context.middleware';
import { JwtPayloadDto } from './dto/auth.dto';

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

  async validate(payload: JwtPayloadDto | { sub: number; username: string }) {
    const userId = BigInt(payload.sub);
    const user = await this.prisma.sysUser.findFirst({
      where: { id: userId, deletedAt: null },
      include: { userRoles: { include: { role: { include: { roleMenus: true } } } }, dept: true },
    });

    if (!user || user.status !== 1) {
      throw new UnauthorizedException('User not found or disabled');
    }

    const roles = user.userRoles.map((userRole) => userRole.role);
    const permissions = await this.extractPermissions(user.userRoles, user.isPlatformAdmin === 1);
    setTenantContext({
      userId: user.id,
      tenantId: user.tenantId,
      isPlatformAdmin: user.isPlatformAdmin === 1,
      deptId: user.deptId,
      roles: roles.map((role) => ({ id: role.id, dataScope: role.dataScope })),
    });

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      deptId: user.deptId,
      roles: roles.map((r) => ({ id: r.id, code: r.code, name: r.name, dataScope: r.dataScope })),
      permissions,
    };
  }

  private async extractPermissions(
    userRoles: { role: { code: string; roleMenus: { menuId: bigint }[] } }[],
    isPlatformAdmin: boolean,
  ): Promise<string[]> {
    if (isPlatformAdmin || userRoles.some((userRole) => userRole.role.code === 'platform_admin')) {
      const menus = await this.prisma.sysMenu.findMany({
        where: { status: 1, perms: { not: '' } },
        select: { perms: true },
      });
      return menus.map((menu) => menu.perms).filter(Boolean) as string[];
    }

    const menuIds = new Set<bigint>(
      userRoles.flatMap((userRole) => userRole.role.roleMenus.map((roleMenu) => roleMenu.menuId)),
    );

    if (!menuIds.size) return [];

    const menus = await this.prisma.sysMenu.findMany({
      where: { id: { in: Array.from(menuIds) }, status: 1, perms: { not: '' } },
      select: { perms: true },
    });
    return [...new Set(menus.map((menu) => menu.perms).filter(Boolean) as string[])];
  }
}
