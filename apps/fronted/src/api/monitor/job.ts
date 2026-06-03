import { request } from '@/utils/request';
import type { Id } from '@/types/api';

export const jobApi = {
  list: (params?: Record<string, unknown>) =>
    request<unknown>({ url: '/monitor/job/list', method: 'get', params }),
  findOne: (id: Id) => request<unknown>({ url: `/monitor/job/${id}`, method: 'get' }),
  create: (data: unknown) => request<void>({ url: '/monitor/job', method: 'post', data }),
  update: (data: unknown) => request<void>({ url: '/monitor/job', method: 'put', data }),
  delete: (id: Id) => request<void>({ url: `/monitor/job/${id}`, method: 'delete' }),
  dispatch: (id: Id) => request<void>({ url: `/monitor/job/${id}/dispatch`, method: 'post' }),
};
