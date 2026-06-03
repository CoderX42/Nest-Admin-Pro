import { request } from '@/utils/request';
import type { Id } from '@/types/api';

export const configApi = {
  list: (params?: Record<string, unknown>) =>
    request<unknown>({ url: '/system/config/list', method: 'get', params }),
  findOne: (id: Id) => request<unknown>({ url: `/system/config/${id}`, method: 'get' }),
  findByKey: (key: string) =>
    request<unknown>({ url: `/system/config/key/${key}`, method: 'get' }),
  create: (data: unknown) => request<void>({ url: '/system/config', method: 'post', data }),
  update: (data: unknown) => request<void>({ url: '/system/config', method: 'put', data }),
  delete: (id: Id) => request<void>({ url: `/system/config/${id}`, method: 'delete' }),
  refresh: () => request<void>({ url: '/system/config/refresh', method: 'put' }),
};
