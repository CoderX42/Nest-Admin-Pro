import { defineStore } from 'pinia';

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  deptName?: string;
  roles: string[];
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('nap_token') || uni.getStorageSync('token') || '',
    userInfo: null as UserInfo | null,
  }),

  actions: {
    setToken(token: string) {
      this.token = token;
      uni.setStorageSync('nap_token', token);
      uni.removeStorageSync('token');
    },

    setUserInfo(info: UserInfo) {
      this.userInfo = info;
    },

    async login(username: string, password: string) {
      const { authApi } = await import('@/api/auth');
      const res: any = await authApi.login({ username, password });
      this.setToken(res.token);
      const info: any = await authApi.getUserInfo();
      this.setUserInfo(info.user);
      return res;
    },

    async getUserInfo() {
      try {
        const { authApi } = await import('@/api/auth');
        const info: any = await authApi.getUserInfo();
        this.setUserInfo(info.user);
        return info;
      } catch {
        this.reset();
      }
    },

    async logout() {
      try {
        const { authApi } = await import('@/api/auth');
        await authApi.logout();
      } finally {
        this.reset();
      }
    },

    reset() {
      this.token = '';
      this.userInfo = null;
      uni.removeStorageSync('nap_token');
      uni.removeStorageSync('token');
    },
  },
});
