import { request } from '@/utils/request';
import type { AuthUserInfo, CaptchaResult, LoginForm, LoginResult } from '@/types/auth';

export const authApi = {
  login: (data: LoginForm) =>
    request<LoginResult>({ url: '/auth/login', method: 'post', data }),
  register: (data: { username: string; password: string; nickname?: string }) =>
    request<void>({ url: '/auth/register', method: 'post', data }),
  captcha: () => request<CaptchaResult>({ url: '/auth/captcha', method: 'get' }),
  validateCaptcha: (key: string, text: string) =>
    request<void>({ url: '/auth/captcha/validate', method: 'post', data: { key, text } }),
  logout: () => request<void>({ url: '/auth/logout', method: 'post' }),
  getUserInfo: () => request<AuthUserInfo>({ url: '/auth/user/info', method: 'get' }),
};
