import { request } from '@/utils/request';
import type { Id, PageResult } from '@/types/api';

interface LoginLogItem {
  id: Id;
  username?: string;
  status?: number;
  message?: string;
  loginAt?: string;
}

export const loginLogApi = {
  list: (params?: Record<string, unknown>) =>
    request<PageResult<LoginLogItem> | { items?: LoginLogItem[]; total?: number }>({
      url: '/monitor/login-log/list',
      method: 'get',
      params,
    }),
  clean: () => request<void>({ url: '/monitor/login-log/clean', method: 'delete' }),
};
