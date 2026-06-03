// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { authApi } from '@/api/auth';
import { useUserStore } from './user';

vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    getUserInfo: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('useUserStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    vi.mocked(authApi.login).mockReset();
    vi.mocked(authApi.getUserInfo).mockReset();
    vi.mocked(authApi.logout).mockReset();
  });

  it('stores token and permissions after login', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: 'token-a',
      userInfo: {
        id: '1',
        tenantId: null,
        username: 'admin',
        nickname: 'Admin',
        roles: ['admin'],
      },
    });
    vi.mocked(authApi.getUserInfo).mockResolvedValue({
      user: {
        id: '1',
        tenantId: null,
        username: 'admin',
        nickname: 'Admin',
        roles: ['admin'],
      },
      roles: ['admin'],
      permissions: ['*:*:*'],
      menus: [],
    });

    const store = useUserStore();
    await store.login({
      username: 'admin',
      password: 'admin123',
      captchaKey: 'captcha-key',
      captchaText: '1234',
    });

    expect(store.token).toBe('token-a');
    expect(store.permissions).toEqual(['*:*:*']);
  });
});
