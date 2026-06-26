
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { FastifyRequest } from 'fastify';
import { OPER_LOG_KEY, OperLogMeta } from '@/common/decorators/oper-log.decorator';
import { OperLogService } from '@/modules/system/log/log.service';
import { IAuthUser } from '@/common/decorators/current-user.decorator';

@Injectable()
export class OperLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly operLog: OperLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<OperLogMeta>(OPER_LOG_KEY, context.getHandler());
    if (!meta) return next.handle();

    const req = context.switchToHttp().getRequest<FastifyRequest & { user?: IAuthUser }>();
    const start = Date.now();
    const ip = this.extractIp(req);
    const ua = (req.headers['user-agent'] as string) ?? '';
    const uid = req.user?.uid ?? 0;
    const username = req.user?.username ?? '';

    const paramsStr = meta.saveParams !== false ? this.safeStringify(req.body) : undefined;

    return next.handle().pipe(
      tap((data) => {
        const cost = Date.now() - start;
        const resultStr = meta.saveResult ? this.safeStringify(data) : undefined;
        void this.operLog.record({
          uid,
          username,
          module: meta.module,
          action: meta.action,
          url: req.url,
          method: req.method,
          params: paramsStr,
          result: resultStr,
          cost,
          status: 1,
          ip,
        });
      }),
      catchError((err) => {
        const cost = Date.now() - start;
        const message = (err && (err.message || err.toString?.())) ?? 'unknown';
        void this.operLog.record({
          uid,
          username,
          module: meta.module,
          action: meta.action,
          url: req.url,
          method: req.method,
          params: paramsStr,
          result: `ERROR: ${message}`.slice(0, 4000),
          cost,
          status: 0,
          ip,
        });
        return throwError(() => err);
      }),
    );
  }

  private extractIp(req: FastifyRequest): string {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff) return xff.split(',')[0]!.trim();
    return req.ip ?? '';
  }

  private safeStringify(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    try {
      const seen = new WeakSet();
      const json = JSON.stringify(value, (_k, v) => {
        if (typeof v === 'bigint') return v.toString();
        if (v && typeof v === 'object') {
          if (seen.has(v as object)) return '[Circular]';
          seen.add(v as object);
        }
        return v;
      });
      return (json ?? '').slice(0, 4000);
    } catch {
      return undefined;
    }
  }
}
