import { request } from '@/utils/request';
import type { Id } from '@/types/api';

export const deptApi = {
  list: (params?: Record<string, unknown>) =>
    request<unknown[]>({ url: '/system/dept/list', method: 'get', params }),
  tree: () => request<unknown[]>({ url: '/system/dept/tree', method: 'get' }),
  findOne: (id: Id) => request<unknown>({ url: `/system/dept/${id}`, method: 'get' }),
  create: (data: unknown) => request<void>({ url: '/system/dept', method: 'post', data }),
  update: (data: unknown) => request<void>({ url: '/system/dept', method: 'put', data }),
  delete: (id: Id) => request<void>({ url: `/system/dept/${id}`, method: 'delete' }),
};
