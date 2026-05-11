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
    token: uni.getStorageSync('token') || '',
    userInfo: null as UserInfo | null,
  }),

  actions: {
    setToken(token: string) {
      this.token = token;
      uni.setStorageSync('token', token);
    },

    setUserInfo(info: UserInfo) {
      this.userInfo = info;
    },

    async login(username: string, password: string) {
      const { getUserInfo: getInfo } = await import('../api');
      const res: any = await (await import('../api')).authApi.login({ username, password });
      this.setToken(res.token);
      const info: any = await getInfo();
      this.setUserInfo(info.user);
      return res;
    },

    async getUserInfo() {
      try {
        const info: any = await (await import('../api')).authApi.getUserInfo();
        this.setUserInfo(info.user);
        return info;
      } catch {
        this.token = '';
        this.userInfo = null;
        uni.removeStorageSync('token');
      }
    },

    async logout() {
      try {
        await (await import('../api')).authApi.logout();
      } finally {
        this.token = '';
        this.userInfo = null;
        uni.removeStorageSync('token');
      }
    },
  },
});