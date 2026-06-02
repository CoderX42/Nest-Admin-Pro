import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  it('serializes bigint values before wrapping response data', async () => {
    const interceptor = new TransformInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept({} as never, {
        handle: () => of({ id: 1n }),
      }),
    );

    expect(result.data).toEqual({ id: '1' });
  });
});
