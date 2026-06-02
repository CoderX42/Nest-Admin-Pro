import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './api-response';
import { stringifyBigInt } from './utils/bigint.util';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
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
}
