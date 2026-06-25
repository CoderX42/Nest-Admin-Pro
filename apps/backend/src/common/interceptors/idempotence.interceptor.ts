import {
  CallHandler,
  ExecutionContext,
  ExecutionContext as EC,
  Injectable,
  NestInterceptor,
  ConflictException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, of, switchMap, tap } from 'rxjs';
import * as crypto from 'crypto';
import { RedisService } from '@/shared/redis/redis.service';
import { IDEMPOTENCE_KEY, IdempotenceOptions } from '../decorators/idempotence.decorator';
import { genIdempotenceKey } from '@/helper/genRedisKey';

@Injectable()
export class IdempotenceInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  intercept(ctx: EC, next: CallHandler): Observable<any> {
    const opts = this.reflector.getAllAndOverride<IdempotenceOptions>(IDEMPOTENCE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!opts) return next.handle();

    const req = ctx.switchToHttp().getRequest();
    const ttl = (opts.ttl ?? 60) * 1000;
    const key = opts.key ?? this.makeKey(req);
    return from(this.redis.setNx(genIdempotenceKey(key), '1', ttl)).pipe(
      switchMap((ok) => {
        if (!ok) throw new ConflictException({ code: '1009', message: '重复请求' });
        return next.handle();
      }),
    );
  }

  private makeKey(req: any): string {
    const payload = JSON.stringify({
      ip: req.ip,
      url: req.originalUrl ?? req.url,
      method: req.method,
      body: req.body,
    });
    return crypto.createHash('sha1').update(payload).digest('hex');
  }
}
