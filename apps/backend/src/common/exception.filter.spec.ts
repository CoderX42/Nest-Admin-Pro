import { ArgumentsHost } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GlobalExceptionFilter } from './exception.filter';

function createHost() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({ url: '/test', id: 'req-1', headers: {} }),
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

describe('GlobalExceptionFilter', () => {
  const originalAppEnv = process.env.APP_ENV;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.APP_ENV = originalAppEnv;
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('maps Prisma P2002 to a conflict response with a friendly message', () => {
    const { host, response } = createHost();
    const filter = new GlobalExceptionFilter();
    const error = new PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '5.22.0',
    });

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 409, message: '数据已存在' }),
    );
  });

  it('hides generic error messages in production', () => {
    process.env.APP_ENV = 'production';
    const { host, response } = createHost();
    const filter = new GlobalExceptionFilter();

    filter.catch(new Error('secret leak'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 500, message: '服务器内部错误' }),
    );
  });
});
