import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  function createContext(options: { skip?: boolean; headers?: Record<string, string>; url?: string } = {}) {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(options.skip ?? false),
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getResponse: () => ({
          getHeader: (name: string) => options.headers?.[name],
        }),
        getRequest: () => ({ url: options.url ?? '/api/test' }),
      }),
    };

    return {
      interceptor: new TransformInterceptor(reflector as never),
      context: context as never,
    };
  }

  it('serializes bigint values before wrapping response data', async () => {
    const { interceptor, context } = createContext();
    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of({ id: 1n }),
      }),
    );

    expect(result.data).toEqual({ id: '1' });
  });

  it('bypasses wrapping when response has Content-Disposition', async () => {
    const { interceptor, context } = createContext({
      headers: { 'Content-Disposition': 'attachment; filename=test.xlsx' },
    });
    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of(Buffer.from('xlsx')),
      }),
    );

    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('bypasses wrapping when SkipTransform metadata is present', async () => {
    const { interceptor, context } = createContext({ skip: true });
    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of({ status: 'ok' }),
      }),
    );

    expect(result).toEqual({ status: 'ok' });
  });
});
