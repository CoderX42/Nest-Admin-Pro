import { request } from '@/utils/request';
import type { Id } from '@/types/api';

export const tenantApi = {
  list: (params?: Record<string, unknown>) =>
    request<unknown>({ url: '/system/tenant/list', method: 'get', params }),
  findOne: (id: Id) => request<unknown>({ url: `/system/tenant/${id}`, method: 'get' }),
  create: (data: unknown) => request<void>({ url: '/system/tenant', method: 'post', data }),
  update: (data: unknown) => request<void>({ url: '/system/tenant', method: 'put', data }),
  delete: (id: Id) => request<void>({ url: `/system/tenant/${id}`, method: 'delete' }),
};
