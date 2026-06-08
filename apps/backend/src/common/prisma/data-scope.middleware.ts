import type { Prisma } from '@prisma/client';
import { requestContext, type TenantContextUser } from '../middleware/request-context.middleware';

export const DATASCOPE_AWARE_MODELS = new Set<string>([
  'SysUser',
  'SysFile',
  'SysLoginLog',
  'SysOperLog',
]);

const READ_ACTIONS = new Set(['findFirst', 'findMany', 'count', 'aggregate', 'groupBy']);

export enum DataScopeValue {
  All = 1,
  Custom = 2,
  DeptAndChildren = 3,
  Dept = 4,
  Self = 5,
}

type MiddlewareParams = Prisma.MiddlewareParams;
type MiddlewareNext = (params: MiddlewareParams) => Promise<unknown>;

type DataScopePrisma = {
  sysDept: {
    findMany(args: Prisma.SysDeptFindManyArgs): Promise<{ id: bigint; parentId: bigint }[]>;
  };
  sysRoleDept: {
    findMany(args: Prisma.SysRoleDeptFindManyArgs): Promise<{ deptId: bigint }[]>;
  };
};

export function dataScopeMiddleware(prisma: DataScopePrisma) {
  return async (params: MiddlewareParams, next: MiddlewareNext) => next(await applyDataScope(params, requestContext.getStore()?.user, prisma));
}

export async function applyDataScope(
  params: MiddlewareParams,
  user: TenantContextUser | undefined,
  prisma: DataScopePrisma,
) {
  if (!user || user.isPlatformAdmin || !params.model || !DATASCOPE_AWARE_MODELS.has(params.model)) {
    return params;
  }
  if (!READ_ACTIONS.has(params.action)) {
    return params;
  }

  const scope = getWidestScope(user.roles);
  if (scope === DataScopeValue.All) return params;

  const scopeWhere = await buildDataScopeWhere(params.model, scope, user, prisma);
  if (!scopeWhere) return params;

  params.args ??= {};
  params.args.where = { AND: [params.args.where ?? {}, scopeWhere] };
  return params;
}

export function getWidestScope(roles: { dataScope: number }[] | undefined) {
  if (!roles?.length) return DataScopeValue.Self;
  return Math.min(...roles.map((role) => role.dataScope || DataScopeValue.Self));
}

async function buildDataScopeWhere(
  model: string,
  scope: DataScopeValue,
  user: TenantContextUser,
  prisma: DataScopePrisma,
) {
  if (scope === DataScopeValue.Self) {
    return buildUserWhere(model, user.userId);
  }

  const deptIds = await resolveDeptIds(scope, user, prisma);
  if (!deptIds.length) {
    return buildImpossibleWhere(model);
  }
  return buildDeptWhere(model, deptIds);
}

async function resolveDeptIds(scope: DataScopeValue, user: TenantContextUser, prisma: DataScopePrisma) {
  if (scope === DataScopeValue.Custom) {
    const roleIds = user.roles?.map((role) => role.id) ?? [];
    if (!roleIds.length) return [];
    const rows = await prisma.sysRoleDept.findMany({
      where: { roleId: { in: roleIds } },
      select: { deptId: true },
    });
    return rows.map((row) => row.deptId);
  }

  if (!user.deptId) return [];
  if (scope === DataScopeValue.Dept) return [user.deptId];
  if (scope === DataScopeValue.DeptAndChildren) {
    return getDeptAndChildren(prisma, user.deptId);
  }
  return [];
}

async function getDeptAndChildren(prisma: DataScopePrisma, rootDeptId: bigint) {
  const depts = await prisma.sysDept.findMany({
    where: { deletedAt: null },
    select: { id: true, parentId: true },
  });
  const childrenByParent = new Map<string, bigint[]>();
  for (const dept of depts) {
    const key = String(dept.parentId);
    childrenByParent.set(key, [...(childrenByParent.get(key) ?? []), dept.id]);
  }

  const result = new Set<bigint>([rootDeptId]);
  const queue = [rootDeptId];
  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;
    for (const childId of childrenByParent.get(String(current)) ?? []) {
      if (!result.has(childId)) {
        result.add(childId);
        queue.push(childId);
      }
    }
  }
  return [...result];
}

function buildUserWhere(model: string, userId: bigint) {
  if (model === 'SysUser') return { id: userId };
  if (model === 'SysFile') return { uploaderId: userId };
  if (model === 'SysLoginLog' || model === 'SysOperLog') return { userId };
  return null;
}

function buildDeptWhere(model: string, deptIds: bigint[]) {
  if (model === 'SysUser') return { deptId: { in: deptIds } };
  if (model === 'SysFile') return { uploader: { deptId: { in: deptIds } } };
  if (model === 'SysLoginLog' || model === 'SysOperLog') return { user: { deptId: { in: deptIds } } };
  return null;
}

function buildImpossibleWhere(model: string) {
  if (model === 'SysUser') return { id: -1n };
  if (model === 'SysFile') return { id: -1n };
  if (model === 'SysLoginLog' || model === 'SysOperLog') return { id: -1n };
  return null;
}
