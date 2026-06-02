import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns ok with dependency details when db and redis respond', async () => {
    const service = new HealthService(
      { $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]) } as never,
      { ping: jest.fn().mockResolvedValue('PONG') } as never,
    );

    await expect(service.check()).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        db: expect.objectContaining({ status: 'ok' }),
        redis: expect.objectContaining({ status: 'ok' }),
      }),
    );
  });

  it('keeps overall status ok when dependencies are unavailable', async () => {
    const service = new HealthService(
      { $queryRaw: jest.fn().mockRejectedValue(new Error('db down')) } as never,
      { ping: jest.fn().mockRejectedValue(new Error('redis down')) } as never,
    );

    await expect(service.check()).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        db: expect.objectContaining({ status: 'unavailable' }),
        redis: expect.objectContaining({ status: 'unavailable' }),
      }),
    );
  });
});
