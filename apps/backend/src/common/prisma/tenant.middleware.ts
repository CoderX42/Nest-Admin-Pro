import type { Prisma } from '@prisma/client';
import { requestContext } from '../middleware/request-context.middleware';

export const TENANT_AWARE_MODELS = new Set<string>([
  'SysUser',
  'SysRole',
  'SysDept',
  'SysPost',
  'SysNotice',
  'SysFile',
  'SysLoginLog',
  'SysOperLog',
  'SysJob',
  'SysJobLog',
]);

export const PLATFORM_SHARED_MODELS = new Set<string>([
  'SysMenu',
  'SysDictType',
  'SysDictData',
  'SysConfig',
  'SysTenant',
  'GenTable',
  'GenTableField',
]);

type TenantMiddlewareParams = Prisma.MiddlewareParams;
type TenantMiddlewareNext = (params: TenantMiddlewareParams) => Promise<unknown>;

interface TenantUser {
  tenantId: bigint | null;
  isPlatformAdmin: boolean;
}

export function applyTenantScope(params: TenantMiddlewareParams, user: TenantUser | undefined) {
  if (!user || user.isPlatformAdmin || !params.model || !TENANT_AWARE_MODELS.has(params.model)) {
    return params;
  }
  if (user.tenantId === null) {
    return params;
  }
  const tenantId = user.tenantId;

  params.args ??= {};
  switch (params.action) {
    case 'findUnique':
    case 'findFirst':
    case 'findMany':
    case 'count':
    case 'aggregate':
    case 'groupBy':
    case 'update':
    case 'updateMany':
    case 'delete':
    case 'deleteMany':
      params.args.where = withTenantWhere(params.args.where, tenantId);
      break;
    case 'create':
      params.args.data = withTenantData(params.args.data, tenantId);
      break;
    case 'createMany':
      params.args.data = Array.isArray(params.args.data)
        ? params.args.data.map((item: unknown) => withTenantData(item, tenantId))
        : withTenantData(params.args.data, tenantId);
      break;
    case 'upsert':
      params.args.where = withTenantWhere(params.args.where, tenantId);
      params.args.create = withTenantData(params.args.create, tenantId);
      break;
    default:
      break;
  }
  return params;
}

export function tenantMiddleware(params: TenantMiddlewareParams, next: TenantMiddlewareNext) {
  return next(applyTenantScope(params, requestContext.getStore()?.user));
}

function withTenantWhere(where: unknown, tenantId: bigint) {
  return { AND: [where ?? {}, { tenantId }] };
}

function withTenantData(data: unknown, tenantId: bigint) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }
  return { ...data, tenantId };
}
