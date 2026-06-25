import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ErrorEnum, HttpStatusMap } from '@/constants/error.enum';
import { BusinessException } from '../exceptions/business.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();
    const req = ctx.getRequest();

    let code: string = ErrorEnum.INTERNAL;
    let message: string = (exception as any)?.message ?? '服务异常';
    let httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let data: any = null;

    if (exception instanceof BusinessException) {
      code = exception.code;
      message = exception.message;
      httpStatus = HttpStatus.OK;
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      message = typeof res === 'string' ? res : (res.message ?? exception.message);
      code = this.statusToCode(exception.getStatus());
      httpStatus = exception.getStatus();
    } else if (exception instanceof Error) {
      this.logger.error(`[${req?.method} ${req?.url}] ${exception.stack ?? exception.message}`);
    }

    res.status(httpStatus).send({
      code,
      data,
      message: this.productionSafeMessage(message, code),
      timestamp: Date.now(),
      path: req?.url,
    });
  }

  private statusToCode(status: number): string {
    const found = Object.entries(HttpStatusMap).find(([, v]) => v === status);
    return found?.[0] ?? ErrorEnum.INTERNAL;
  }

  private productionSafeMessage(msg: string, code: string) {
    if (process.env.APP_ENV === 'production' && code === ErrorEnum.INTERNAL) {
      return '服务异常，请稍后再试';
    }
    return Array.isArray(msg) ? msg.join('; ') : msg;
  }
}
