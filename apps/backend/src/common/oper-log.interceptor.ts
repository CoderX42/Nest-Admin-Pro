import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PrismaService } from './prisma.service';

@Injectable()
export class OperLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap((data) => {
        this.writeLog(request, data, null, Date.now() - startedAt);
      }),
      catchError((error) => {
        this.writeLog(request, null, error, Date.now() - startedAt);
        return throwError(() => error);
      }),
    );
  }

  private writeLog(request: any, data: any, error: any, duration: number) {
    if (!this.shouldLog(request)) return;

    const user = request.user;
    const url = request.originalUrl || request.url || '';
    const moduleName = this.getModuleName(url);

    this.prisma.sysOperLog
      .create({
        data: {
          userId: user?.id ? BigInt(user.id) : null,
          username: user?.username || 'anonymous',
          module: moduleName,
          method: `${request.method} ${url}`,
          reqMethod: request.method,
          reqUrl: url,
          reqParam: this.stringify({
            params: request.params,
            query: request.query,
            body: this.redact(request.body),
          }),
          respResult: error ? null : this.stringify(data),
          status: error ? 0 : 1,
          errorMsg: error ? error.message || String(error) : null,
          duration,
          ip: request.ip || request.socket?.remoteAddress || '',
        },
      })
      .catch(() => {
        // Logging must never break the business request.
      });
  }

  private shouldLog(request: any) {
    const method = request.method;
    const url = request.originalUrl || request.url || '';
    if (!request.user) return false;
    if (method === 'GET') return false;
    if (url.includes('/monitor/oper-log')) return false;
    return true;
  }

  private getModuleName(url: string) {
    const parts = url
      .split('?')[0]
      .split('/')
      .filter(Boolean)
      .filter((part) => part !== 'api');
    return parts.slice(0, 2).join('/') || 'unknown';
  }

  private redact(value: any): any {
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map((item) => this.redact(item));

    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('authorization') ||
          lowerKey.includes('captcha')
        ) {
          return [key, '***'];
        }
        return [key, this.redact(val)];
      }),
    );
  }

  private stringify(value: any) {
    if (value === undefined) return undefined;
    try {
      const text = JSON.stringify(value);
      return text.length > 5000 ? `${text.slice(0, 5000)}...` : text;
    } catch {
      return String(value);
    }
  }
}
