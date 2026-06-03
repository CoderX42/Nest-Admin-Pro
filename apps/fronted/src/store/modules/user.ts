import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { authApi } from '@/api/auth';
import type { AuthUserInfo, LoginForm, LoginResult } from '@/types/auth';
import type { MenuItem } from '@/types/menu';
import type { UserInfo } from '@/types/user';
import { usePermissionStore } from './permission';
import { useTagsViewStore } from './tags-view';

export const useUserStore = defineStore('user', () => {
  const token = useStorage('nap_token', localStorage.getItem('token') || '');
  const userInfo = ref<UserInfo | null>(null);
  const roles = ref<string[]>([]);
  const permissions = ref<string[]>([]);
  const menus = ref<MenuItem[]>([]);

  function persistToken(value: string) {
    token.value = value;
    if (value) {
      localStorage.setItem('token', value);
    } else {
      localStorage.removeItem('token');
    }
  }

  async function login(form: LoginForm): Promise<LoginResult> {
    const data = await authApi.login(form);
    persistToken(data.token);
    userInfo.value = data.userInfo;
    await fetchInfo();
    return data;
  }

  async function fetchInfo(): Promise<AuthUserInfo | null> {
    if (!token.value) {
      return null;
    }

    const data = await authApi.getUserInfo();
    userInfo.value = data.user;
    roles.value = data.roles ?? [];
    permissions.value = data.permissions ?? [];
    menus.value = data.menus ?? [];
    await usePermissionStore().generateRoutes(menus.value);
    return data;
  }

  async function getUserInfo() {
    return fetchInfo();
  }

  async function logout(options: { silent?: boolean } = {}) {
    try {
      if (!options.silent) {
        await authApi.logout();
      }
    } finally {
      reset();
    }
  }

  function reset() {
    persistToken('');
    userInfo.value = null;
    roles.value = [];
    permissions.value = [];
    menus.value = [];
    usePermissionStore().reset();
    useTagsViewStore().reset();
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    menus,
    login,
    fetchInfo,
    getUserInfo,
    logout,
    reset,
  };
});
