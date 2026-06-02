import { RequestContextMiddleware, requestContext } from './request-context.middleware';

describe('RequestContextMiddleware', () => {
  it('stores traceId, ip and userAgent in AsyncLocalStorage', (done) => {
    const middleware = new RequestContextMiddleware();
    const req = {
      id: 'req-1',
      headers: {
        'x-forwarded-for': '10.0.0.1, 10.0.0.2',
        'user-agent': 'Jest',
      },
      socket: {},
    } as never;

    middleware.use(req, {} as never, () => {
      expect(requestContext.getStore()).toEqual({
        traceId: 'req-1',
        ip: '10.0.0.1',
        userAgent: 'Jest',
      });
      done();
    });
  });
});
