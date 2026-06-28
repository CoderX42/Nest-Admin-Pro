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
      const resp = exception.getResponse() as any;
      const rawMsg = typeof resp === 'string' ? resp : (resp?.message ?? exception.message);
      message = Array.isArray(rawMsg) ? rawMsg.join('; ') : rawMsg;
      // class-validator 抛 BadRequestException(400) + message: string[]
      const isValidationError =
        exception.getStatus() === HttpStatus.BAD_REQUEST && Array.isArray(resp?.message);
      code = isValidationError
        ? ErrorEnum.PARAMS_INVALID.split(':')[0]
        : this.statusToCode(exception.getStatus());
      httpStatus = exception.getStatus();
    } else if (exception instanceof Error) {
      this.logger.error(`[${req?.method} ${req?.url}] ${exception.stack ?? exception.message}`);
    }

    res.status(httpStatus).send({
      code: code.split(':')[0],
      data,
      message: this.productionSafeMessage(message, code),
      timestamp: Date.now(),
      path: req?.url,
    });
  }

  private statusToCode(status: number): string {
    const found = Object.entries(HttpStatusMap).find(([, v]) => v === status);
    return found?.[0] ?? ErrorEnum.INTERNAL.split(':')[0];
  }

  private productionSafeMessage(msg: string, code: string) {
    if (process.env.APP_ENV === 'production' && code === ErrorEnum.INTERNAL) {
      return '服务异常，请稍后再试';
    }
    return Array.isArray(msg) ? msg.join('; ') : msg;
  }
}
