import { request } from '@/utils/request';

export const profileApi = {
  getProfile: () => request<unknown>({ url: '/auth/profile', method: 'get' }),
  updateProfile: (data: unknown) => request<void>({ url: '/auth/profile', method: 'put', data }),
  updatePassword: (data: { oldPassword: string; newPassword: string }) =>
    request<void>({ url: '/auth/profile/password', method: 'put', data }),
};
