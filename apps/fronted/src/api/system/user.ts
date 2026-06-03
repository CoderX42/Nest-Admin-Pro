import { request } from '@/utils/request';
import type { Id, PageQuery, PageResult } from '@/types/api';
import type { CreateUserDto, SysUser, UpdateUserDto, UserQuery, UserStatus } from '@/types/user';

export const userApi = {
  list: (params: UserQuery & PageQuery) =>
    request<PageResult<SysUser> | { items?: SysUser[]; total?: number }>({
      url: '/system/user/list',
      method: 'get',
      params,
    }),
  findOne: (id: Id) => request<SysUser>({ url: `/system/user/${id}`, method: 'get' }),
  create: (data: CreateUserDto) =>
    request<SysUser>({ url: '/system/user', method: 'post', data }),
  update: (data: UpdateUserDto) => request<void>({ url: '/system/user', method: 'put', data }),
  delete: (id: Id) => request<void>({ url: `/system/user/${id}`, method: 'delete' }),
  resetPassword: (id: Id) =>
    request<void>({ url: `/system/user/reset-password/${id}`, method: 'put' }),
  changeStatus: (id: Id, status: UserStatus) =>
    request<void>({ url: `/system/user/change-status/${id}`, method: 'put', data: { status } }),
  assignRoles: (id: Id, roleIds: Id[]) =>
    request<void>({ url: `/system/user/assign-roles/${id}`, method: 'put', data: { roleIds } }),
};
