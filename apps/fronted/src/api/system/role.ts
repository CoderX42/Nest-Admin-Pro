import { request } from '@/utils/request';
import type { Id, PageQuery, PageResult } from '@/types/api';
import type { CreateRoleDto, RoleQuery, RoleStatus, SysRole, UpdateRoleDto } from '@/types/role';

export const roleApi = {
  list: (params: RoleQuery & PageQuery) =>
    request<PageResult<SysRole> | { items?: SysRole[]; total?: number }>({
      url: '/system/role/list',
      method: 'get',
      params,
    }),
  findOne: (id: Id) => request<SysRole>({ url: `/system/role/${id}`, method: 'get' }),
  create: (data: CreateRoleDto) => request<void>({ url: '/system/role', method: 'post', data }),
  update: (data: UpdateRoleDto) => request<void>({ url: '/system/role', method: 'put', data }),
  delete: (id: Id) => request<void>({ url: `/system/role/${id}`, method: 'delete' }),
  changeStatus: (id: Id, status: RoleStatus) =>
    request<void>({ url: `/system/role/change-status/${id}`, method: 'put', data: { status } }),
  assignPermissions: (id: Id, menuIds: Id[], deptIds?: Id[]) =>
    request<void>({
      url: `/system/role/assign-permissions/${id}`,
      method: 'put',
      data: { menuIds, deptIds },
    }),
  getRoleMenus: (id: Id) =>
    request<{ checkedKeys: Id[]; halfCheckedKeys: Id[] }>({
      url: `/system/role/menu/${id}`,
      method: 'get',
    }),
};
