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
      include: {
        roles: { include: { menuIds: true } },
        dept: true,
      },
    });

    if (!user || user.status !== 1 || user.isDelete === 1) {
      throw new UnauthorizedException('User not found or disabled');
    }

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      deptId: user.deptId,
      roles: user.roles.map((r) => ({ id: r.id, code: r.code, name: r.name })),
      permissions: this.extractPermissions(user.roles),
    };
  }

  private extractPermissions(roles: any[]): string[] {
    const permissions: string[] = [];
    for (const role of roles) {
      try {
        const menuIds = JSON.parse(role.menuIds || '[]');
        permissions.push(...menuIds);
      } catch {
        // ignore
      }
    }
    return [...new Set(permissions)];
  }
}