import { request } from '@/utils/request';

export const onlineApi = {
  list: () => request<unknown[]>({ url: '/monitor/online/list', method: 'get' }),
  forceLogout: (token: string) =>
    request<void>({ url: `/monitor/online/force-logout/${token}`, method: 'post' }),
};
