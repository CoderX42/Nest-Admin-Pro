import { request } from '@/utils/request';
import type { Id } from '@/types/api';

export const noticeApi = {
  list: (params?: Record<string, unknown>) =>
    request<unknown>({ url: '/system/notice/list', method: 'get', params }),
  findOne: (id: Id) => request<unknown>({ url: `/system/notice/${id}`, method: 'get' }),
  create: (data: unknown) => request<void>({ url: '/system/notice', method: 'post', data }),
  update: (data: unknown) => request<void>({ url: '/system/notice', method: 'put', data }),
  delete: (id: Id) => request<void>({ url: `/system/notice/${id}`, method: 'delete' }),
};
