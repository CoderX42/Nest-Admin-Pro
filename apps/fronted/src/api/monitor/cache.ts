import { request } from '@/utils/request';

export const cacheApi = {
  info: () => request<unknown>({ url: '/monitor/cache/info', method: 'get' }),
  keys: (pattern?: string) =>
    request<string[]>({ url: '/monitor/cache/keys', method: 'get', params: { pattern } }),
  value: (key: string) =>
    request<unknown>({ url: '/monitor/cache/value', method: 'get', params: { key } }),
  clear: () => request<void>({ url: '/monitor/cache/clear', method: 'post' }),
  delete: (key: string) =>
    request<void>({ url: '/monitor/cache/delete', method: 'post', params: { key } }),
};
