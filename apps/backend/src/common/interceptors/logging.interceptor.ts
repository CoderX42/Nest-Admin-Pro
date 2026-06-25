import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    if (process.env.APP_ENV === 'production') return next.handle();
    const req = ctx.switchToHttp().getRequest();
    const { method, url, ip } = req;
    const ua = req.headers?.['user-agent'];
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const cost = Date.now() - start;
        this.logger.log(`${method} ${url} (${ip}) ${cost}ms ${ua ?? ''}`);
      }),
    );
  }
}
