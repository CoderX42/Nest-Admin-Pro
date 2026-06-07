import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';

describe('TenantService', () => {
  it('returns paginated tenant items', async () => {
    const service = new TenantService({
      sysTenant: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockResolvedValue([
          { id: 1n, name: '平台总部', code: 'platform' },
          { id: 2n, name: '租户A', code: 'tenant-a' },
        ]),
      },
    } as never);

    await expect(service.list({ page: 1, limit: 10 })).resolves.toEqual({
      total: 2,
      items: [
        { id: 1n, name: '平台总部', code: 'platform' },
        { id: 2n, name: '租户A', code: 'tenant-a' },
      ],
    });
  });

  it('rejects active duplicate tenant code', async () => {
    const service = new TenantService({
      sysTenant: {
        findUnique: jest.fn().mockResolvedValue({ id: 1n, code: 'demo', deletedAt: null }),
        create: jest.fn(),
      },
    } as never);

    await expect(service.create({ name: 'Demo', code: 'demo' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException for missing tenant detail', async () => {
    const service = new TenantService({
      sysTenant: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    } as never);

    await expect(service.findOne(404)).rejects.toBeInstanceOf(NotFoundException);
  });
});
