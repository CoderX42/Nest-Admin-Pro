import { request } from '@/utils/request';

export const loginLogApi = {
  list: (params?: Record<string, unknown>) =>
    request<unknown>({ url: '/monitor/login-log/list', method: 'get', params }),
  clean: () => request<void>({ url: '/monitor/login-log/clean', method: 'delete' }),
};
