import { defineStore } from 'pinia';
import { authApi } from '../../api';

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  remark?: string;
  deptName?: string;
  roles: string[];
}

interface MenuItem {
  id: number;
  name: string;
  type: number;
  path?: string;
  component?: string;
  icon?: string;
  children?: MenuItem[];
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null as UserInfo | null,
    menus: [] as MenuItem[],
    permissions: [] as string[],
  }),

  actions: {
    async login(username: string, password: string) {
      const res: any = await authApi.login({ username, password });
      this.token = res.token;
      this.userInfo = res.userInfo;
      localStorage.setItem('token', res.token);
      // Fetch full userInfo with menus and permissions
      await this.getUserInfo();
      return res;
    },

    async getUserInfo() {
      if (!this.token) return null;
      const res: any = await authApi.getUserInfo();
      this.userInfo = res.user;
      this.menus = res.menus || [];
      this.permissions = res.permissions || [];
      return res;
    },

    async logout() {
      try {
        await authApi.logout();
      } finally {
        this.token = '';
        this.userInfo = null;
        this.menus = [];
        this.permissions = [];
        localStorage.removeItem('token');
      }
    },

    reset() {
      this.token = '';
      this.userInfo = null;
      this.menus = [];
      this.permissions = [];
      localStorage.removeItem('token');
    },
  },
});
