import { request } from '@/utils/request';
import type { Id, PageQuery } from '@/types/api';

export const postApi = {
  list: (params?: PageQuery & Record<string, unknown>) =>
    request<unknown>({ url: '/system/post/list', method: 'get', params }),
  findOne: (id: Id) => request<unknown>({ url: `/system/post/${id}`, method: 'get' }),
  create: (data: unknown) => request<void>({ url: '/system/post', method: 'post', data }),
  update: (data: unknown) => request<void>({ url: '/system/post', method: 'put', data }),
  delete: (id: Id) => request<void>({ url: `/system/post/${id}`, method: 'delete' }),
};
