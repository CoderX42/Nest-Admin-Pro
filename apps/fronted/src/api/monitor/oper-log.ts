import { request } from '@/utils/request';

export const operLogApi = {
  list: (params?: Record<string, unknown>) =>
    request<unknown>({ url: '/monitor/oper-log/list', method: 'get', params }),
  clean: () => request<void>({ url: '/monitor/oper-log/clean', method: 'delete' }),
};
