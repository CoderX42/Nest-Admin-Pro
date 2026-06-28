import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { ErrorEnum } from '@/constants/error.enum';
import { BYPASS_KEY } from '../decorators/bypass.decorator';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const bypass = this.reflector.getAllAndOverride<boolean>(BYPASS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (bypass) return next.handle();

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
          return data;
        }
        return {
          code: ErrorEnum.SUCCESS.split(':')[0],
          data: data ?? null,
          message: ErrorEnum.SUCCESS.split(':')[1],
        };
      }),
    );
  }
}
