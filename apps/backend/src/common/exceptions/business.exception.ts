import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '@/constants/error.enum';

/**
 * 业务异常：HTTP 状态码固定 200，错误码在 body.code 中
 */
export class BusinessException extends HttpException {
  constructor(code: string = ErrorEnum.FAIL, message?: string) {
    const [c, defaultMsg] = code.split(':');
    super(
      { code: c ?? '1', message: message ?? defaultMsg ?? 'fail' },
      HttpStatus.OK,
    );
    this.code = c ?? code;
  }
  readonly code: string;
}
