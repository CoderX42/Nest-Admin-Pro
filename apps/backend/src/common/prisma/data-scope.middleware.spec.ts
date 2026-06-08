import type { Prisma } from '@prisma/client';
import { applyDataScope, DataScopeValue, getWidestScope } from './data-scope.middleware';

const prisma = {
  sysDept: {
    findMany: jest.fn().mockResolvedValue([
      { id: 2n, parentId: 0n },
      { id: 21n, parentId: 2n },
      { id: 211n, parentId: 21n },
      { id: 22n, parentId: 2n },
    ]),
  },
  sysRoleDept: {
    findMany: jest.fn().mockResolvedValue([{ deptId: 21n }, { deptId: 22n }]),
  },
};

describe('data scope middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the widest role scope', () => {
    expect(getWidestScope([{ dataScope: 5 }, { dataScope: 3 }, { dataScope: 4 }])).toBe(DataScopeValue.DeptAndChildren);
  });

  it('bypasses platform admin and all scope', async () => {
    const params = createParams('SysUser');

    await expect(applyDataScope(params, { userId: 1n, tenantId: 1n, isPlatformAdmin: true }, prisma)).resolves.toBe(params);
    await expect(
      applyDataScope(createParams('SysUser'), {
        userId: 1n,
        tenantId: 1n,
        isPlatformAdmin: false,
        roles: [{ id: 1n, dataScope: 1 }],
      }, prisma),
    ).resolves.toEqual(createParams('SysUser'));
  });

  it('injects custom dept scope', async () => {
    const params = await applyDataScope(
      createParams('SysUser'),
      { userId: 2n, tenantId: 2n, isPlatformAdmin: false, roles: [{ id: 2n, dataScope: 2 }] },
      prisma,
    );

    expect(params.args?.where).toEqual({ AND: [{ deletedAt: null }, { deptId: { in: [21n, 22n] } }] });
  });

  it('injects dept and children scope', async () => {
    const params = await applyDataScope(
      createParams('SysUser'),
      { userId: 2n, tenantId: 2n, isPlatformAdmin: false, deptId: 2n, roles: [{ id: 2n, dataScope: 3 }] },
      prisma,
    );

    expect(params.args?.where).toEqual({ AND: [{ deletedAt: null }, { deptId: { in: [2n, 21n, 22n, 211n] } }] });
  });

  it('injects dept scope', async () => {
    const params = await applyDataScope(
      createParams('SysUser'),
      { userId: 2n, tenantId: 2n, isPlatformAdmin: false, deptId: 21n, roles: [{ id: 2n, dataScope: 4 }] },
      prisma,
    );

    expect(params.args?.where).toEqual({ AND: [{ deletedAt: null }, { deptId: { in: [21n] } }] });
  });

  it('injects self scope using user id for SysUser', async () => {
    const params = await applyDataScope(
      createParams('SysUser'),
      { userId: 2n, tenantId: 2n, isPlatformAdmin: false, roles: [{ id: 2n, dataScope: 5 }] },
      prisma,
    );

    expect(params.args?.where).toEqual({ AND: [{ deletedAt: null }, { id: 2n }] });
  });
});

function createParams(model: Prisma.ModelName): Prisma.MiddlewareParams {
  return {
    model,
    action: 'findMany',
    args: { where: { deletedAt: null } },
    dataPath: [],
    runInTransaction: false,
  };
}
