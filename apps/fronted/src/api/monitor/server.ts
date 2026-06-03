import { request } from '@/utils/request';

export const serverApi = {
  info: () => request<unknown>({ url: '/monitor/server/info', method: 'get' }),
};
