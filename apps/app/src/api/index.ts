import { get, put } from '../utils/request';
export { authApi } from './auth';

const BASE_URL = 'http://localhost:3000/api';

export const userApi = {
  getProfile: () => get('/auth/profile'),
  updateProfile: (data: any) => put('/auth/profile', data),
  updatePassword: (data: { oldPassword: string; newPassword: string }) => put('/auth/profile/password', data),
  uploadAvatar: (filePath: string) => {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token');
      uni.uploadFile({
        url: `${BASE_URL}/file/upload`,
        filePath,
        name: 'file',
        header: { Authorization: `Bearer ${token}` },
        success: (res) => {
          const data = JSON.parse(res.data as string);
          if (data.code === 200) {
            resolve(data.data);
          } else {
            reject(data);
          }
        },
        fail: reject,
      });
    });
  },
};
