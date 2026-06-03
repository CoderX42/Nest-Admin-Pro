import { get, put, upload } from '@/utils/request';
export { authApi } from './auth';

export const userApi = {
  getProfile: () => get('/auth/profile'),
  updateProfile: (data: any) => put('/auth/profile', data),
  updatePassword: (data: { oldPassword: string; newPassword: string }) => put('/auth/profile/password', data),
  uploadAvatar: (filePath: string) => upload<{ url: string }>({ url: '/file/upload', filePath }),
};
