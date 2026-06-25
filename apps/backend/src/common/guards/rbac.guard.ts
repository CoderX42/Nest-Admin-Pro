import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/shared/redis/redis.service';
import {
  ALLOW_ANON_KEY,
} from '../decorators/allow-anon.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERM_KEY } from '../decorators/perm.decorator';
import { genPermKey } from '@/helper/genRedisKey';
import { IAuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const isAnon = this.reflector.getAllAndOverride<boolean>(ALLOW_ANON_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    const perms = this.reflector.getAllAndOverride<string | string[]>(PERM_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // 没有声明 @Perm()：要么匿名放行，要么抛 403
    if (!perms || (Array.isArray(perms) && perms.length === 0)) {
      if (isAnon) return true;
      throw new ForbiddenException({ code: '1003', message: '无权限访问' });
    }

    const req = ctx.switchToHttp().getRequest();
    const user: IAuthUser = req.user;
    if (!user?.uid) throw new ForbiddenException({ code: '1002', message: '未登录' });

    // admin 角色 bypass
    const adminRole = this.config.get<string>('app.adminRole') ?? 'super_admin';
    if (user.roles?.includes(adminRole)) return true;

    const permList = await this.getUserPerms(user.uid);
    const required = Array.isArray(perms) ? perms : [perms];
    const ok = required.some((p) => permList.includes(p));
    if (!ok) {
      throw new ForbiddenException({ code: '3004', message: '无访问权限' });
    }
    return true;
  }

  private async getUserPerms(uid: number): Promise<string[]> {
    const cached = await this.redis.get(genPermKey(uid));
    if (cached) return JSON.parse(cached);
    return [];
  }
}
