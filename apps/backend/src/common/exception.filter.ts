import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url?: string; id?: string; headers?: Record<string, string> }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.getHttpExceptionMessage(exception);
    } else if (exception instanceof PrismaClientKnownRequestError) {
      const prismaResult = this.getPrismaError(exception);
      status = prismaResult.status;
      message = prismaResult.message;
    } else if (exception instanceof Error) {
      message = this.shouldExposeInternalMessage() ? exception.message : '服务器内部错误';
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      code: status,
      data: null,
      message,
      timestamp: Date.now(),
      path: request.url ?? '',
      requestId: request.id ?? request.headers?.['x-request-id'] ?? '',
    });
  }

  private getHttpExceptionMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'string') return exceptionResponse;
    if (typeof exceptionResponse !== 'object' || exceptionResponse === null) return exception.message;

    const message = (exceptionResponse as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join('; ');
    return message ?? exception.message;
  }

  private getPrismaError(exception: PrismaClientKnownRequestError) {
    if (exception.code === 'P2002') {
      return { status: HttpStatus.CONFLICT, message: '数据已存在' };
    }
    if (exception.code === 'P2025') {
      return { status: HttpStatus.NOT_FOUND, message: '记录不存在' };
    }
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: '服务器内部错误' };
  }

  private shouldExposeInternalMessage() {
    return process.env.APP_ENV !== 'production' && process.env.NODE_ENV !== 'production';
  }
}
