import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_ANON_KEY } from '../decorators/allow-anon.decorator';
import { RedisService } from '@/shared/redis/redis.service';
import {
  genPasswordVersionKey,
  genTokenBlacklistKey,
  genTokenKey,
} from '@/helper/genRedisKey';
import { IAuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException({ code: '1002', message: '未登录' });

    try {
      const payload = await this.jwt.verifyAsync<IAuthUser & { jti: string }>(token, {
        secret: this.config.get<string>('jwt.secret'),
      });
      (req as any).user = payload;

      // 1. 黑名单校验
      const blacklisted = await this.redis.get(genTokenBlacklistKey(payload.jti));
      if (blacklisted) throw new UnauthorizedException({ code: '1007', message: '令牌已失效' });

      // 2. 密码版本校验（修改密码后旧 token 失效）
      let pv = await this.redis.get(genPasswordVersionKey(payload.uid));
      if (pv === null) {
        // Redis 缓存缺失（被踢下线 / 缓存被清）→ 回源 DB 校验
        const rows = await this.dataSource.query(
          'SELECT `pv` FROM sys_user WHERE `id` = ? LIMIT 1',
          [Number(payload.uid)],
        );
        pv = rows?.[0]?.pv != null ? String(rows[0].pv) : null;
      }
      if (pv !== null && Number(pv) !== payload.pv) {
        throw new UnauthorizedException({ code: '2009', message: '密码已变更，请重新登录' });
      }

      // 3. 单设备登录校验（存在且不一致则视为无效）
      const sessionToken = await this.redis.get(genTokenKey(payload.uid, payload.jti));
      if (sessionToken && sessionToken !== token) {
        throw new UnauthorizedException({ code: '1007', message: '令牌不一致' });
      }

      // 4. demo 写保护（POST/PUT/DELETE/PATCH 拒绝）
      const method = req.method?.toUpperCase();
      const isWrite = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
      if (isWrite && this.config.get<boolean>('app.isDemo')) {
        throw new UnauthorizedException({ code: '1008', message: '演示模式禁止写入' });
      }

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException({ code: '1007', message: '令牌无效或已过期' });
    }
  }

  private extractToken(req: any): string | undefined {
    const auth = req.headers?.authorization;
    if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
    if (req.cookies?.access_token) return req.cookies.access_token;
    return undefined;
  }
}
