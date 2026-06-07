import type { Prisma } from '@prisma/client';
import { applyTenantScope, PLATFORM_SHARED_MODELS, TENANT_AWARE_MODELS } from './tenant.middleware';

describe('tenant middleware', () => {
  it('keeps the expected tenant-aware and shared model sets', () => {
    expect(TENANT_AWARE_MODELS.has('SysUser')).toBe(true);
    expect(TENANT_AWARE_MODELS.has('SysOperLog')).toBe(true);
    expect(PLATFORM_SHARED_MODELS.has('SysMenu')).toBe(true);
    expect(PLATFORM_SHARED_MODELS.has('SysTenant')).toBe(true);
  });

  it('injects tenantId into read where clauses', () => {
    const params = applyTenantScope(
      {
        model: 'SysUser',
        action: 'findMany',
        args: { where: { status: 1 } },
        dataPath: [],
        runInTransaction: false,
      },
      { tenantId: 2n, isPlatformAdmin: false },
    );

    expect(params.args?.where).toEqual({ AND: [{ status: 1 }, { tenantId: 2n }] });
  });

  it('injects tenantId into create data', () => {
    const params = applyTenantScope(
      {
        model: 'SysNotice',
        action: 'create',
        args: { data: { title: 'hello' } },
        dataPath: [],
        runInTransaction: false,
      },
      { tenantId: 2n, isPlatformAdmin: false },
    );

    expect(params.args?.data).toEqual({ title: 'hello', tenantId: 2n });
  });

  it('allows scripts and platform admins to bypass tenant scoping', () => {
    const params: Prisma.MiddlewareParams = {
      model: 'SysUser',
      action: 'findMany',
      args: { where: { status: 1 } },
      dataPath: [],
      runInTransaction: false,
    };

    expect(applyTenantScope(params, undefined)).toBe(params);
    expect(applyTenantScope(params, { tenantId: 2n, isPlatformAdmin: true })).toBe(params);
  });
});
