import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './api-response';
import { SKIP_TRANSFORM_KEY } from './decorators/skip-transform.decorator';
import { stringifyBigInt } from './utils/bigint.util';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    if (this.shouldBypass(context)) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const serialized = stringifyBigInt(data);
        // If already ApiResponse, return as-is
        if (serialized instanceof ApiResponse) {
          return serialized;
        }
        return ApiResponse.success(serialized);
      }),
    );
  }

  private shouldBypass(context: ExecutionContext): boolean {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipTransform) return true;

    const http = context.switchToHttp();
    const response = http.getResponse<{
      getHeader?: (name: string) => unknown;
    }>();
    const request = http.getRequest<{ url?: string; path?: string }>();
    const contentType = this.headerToString(response.getHeader?.('Content-Type'));
    const contentDisposition = this.headerToString(response.getHeader?.('Content-Disposition'));
    const path = request.url ?? request.path ?? '';

    return (
      contentType.includes('text/event-stream') ||
      contentDisposition.length > 0 ||
      path.startsWith('/api-docs') ||
      path.startsWith('/doc.html') ||
      path.startsWith('/health') ||
      path.startsWith('/file/') ||
      /\/(export|download)(\?|$)/.test(path)
    );
  }

  private headerToString(value: unknown): string {
    if (Array.isArray(value)) return value.join(',');
    return typeof value === 'string' ? value : '';
  }
}
