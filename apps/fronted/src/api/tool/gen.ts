import { request } from '@/utils/request';
import type { Id } from '@/types/api';

export const genApi = {
  tableList: (params?: Record<string, unknown>) =>
    request<unknown>({ url: '/gen/table/list', method: 'get', params }),
  importTable: (tableNames: string[]) =>
    request<void>({ url: '/gen/table/import', method: 'post', data: { tableNames } }),
  syncTable: (id: Id) => request<void>({ url: `/gen/table/${id}/sync`, method: 'put' }),
  preview: (id: Id) => request<unknown>({ url: `/gen/table/${id}/preview`, method: 'get' }),
  download: (id: Id) =>
    request<Blob>({ url: `/gen/table/${id}/download`, method: 'get', responseType: 'blob' }),
};
