import { request } from '@/utils/request';
import type { Id } from '@/types/api';

export const dictApi = {
  typeList: (params?: Record<string, unknown>) =>
    request<unknown[]>({ url: '/system/dict/type/list', method: 'get', params }),
  typeFindOne: (id: Id) =>
    request<unknown>({ url: `/system/dict/type/${id}`, method: 'get' }),
  typeCreate: (data: unknown) =>
    request<void>({ url: '/system/dict/type', method: 'post', data }),
  typeUpdate: (data: unknown) =>
    request<void>({ url: '/system/dict/type', method: 'put', data }),
  typeDelete: (id: Id) =>
    request<void>({ url: `/system/dict/type/${id}`, method: 'delete' }),
  dataList: (dictTypeId: Id) =>
    request<unknown[]>({ url: '/system/dict/data/list', method: 'get', params: { dictTypeId } }),
  dataCreate: (data: unknown) =>
    request<void>({ url: '/system/dict/data', method: 'post', data }),
  dataUpdate: (data: unknown) =>
    request<void>({ url: '/system/dict/data', method: 'put', data }),
  dataDelete: (id: Id) =>
    request<void>({ url: `/system/dict/data/${id}`, method: 'delete' }),
};
