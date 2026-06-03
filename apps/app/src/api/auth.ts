import { get, post } from '../utils/request';

export interface LoginPayload {
  username: string;
  password: string;
  captchaKey?: string;
  captchaText?: string;
}

export interface CaptchaResult {
  key: string;
  img?: string;
  svg?: string;
}

export const authApi = {
  login: (data: LoginPayload) => post('/auth/login', data),
  wxLogin: (code: string) => post('/auth/wx/login', { code }),
  wxPhone: (data: { code: string }) => post('/auth/wx/phone', data),
  captcha: () => get<CaptchaResult>('/auth/captcha'),
  validateCaptcha: (key: string, text: string) =>
    post('/auth/captcha/validate', { key, text }),
  getUserInfo: () => get('/auth/user/info'),
  logout: () => post('/auth/logout'),
};
