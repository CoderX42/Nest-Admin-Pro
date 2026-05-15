import { defineStore } from 'pinia';
import { authApi } from '../../api';

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
      this.token = res.data.token;
      this.userInfo = res.data.userInfo;
      localStorage.setItem('token', res.data.token);
      // Fetch full userInfo with menus and permissions
      await this.getUserInfo();
      return res;
    },

    async getUserInfo() {
      if (!this.token) return null;
      const res: any = await authApi.getUserInfo();
      // API returns { code, data: { user, menus, permissions } }
      const data = res.data || res;
      this.userInfo = data.user;
      this.menus = data.menus || [];
      this.permissions = data.permissions || [];
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