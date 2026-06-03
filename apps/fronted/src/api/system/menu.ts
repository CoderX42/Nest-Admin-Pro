import { request } from '@/utils/request';
import type { Id } from '@/types/api';
import type { MenuItem, MenuQuery } from '@/types/menu';

export const menuApi = {
  list: (params?: MenuQuery) => request<MenuItem[]>({ url: '/system/menu/list', method: 'get', params }),
  tree: () => request<MenuItem[]>({ url: '/system/menu/tree', method: 'get' }),
  buildRoute: (userId: Id) =>
    request<MenuItem[]>({ url: '/system/menu/build-route', method: 'get', params: { userId } }),
  findOne: (id: Id) => request<MenuItem>({ url: `/system/menu/${id}`, method: 'get' }),
  create: (data: unknown) => request<void>({ url: '/system/menu', method: 'post', data }),
  update: (data: unknown) => request<void>({ url: '/system/menu', method: 'put', data }),
  delete: (id: Id) => request<void>({ url: `/system/menu/${id}`, method: 'delete' }),
};
