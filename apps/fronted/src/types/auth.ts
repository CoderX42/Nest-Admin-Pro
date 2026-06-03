import type { Id } from './api';
import type { MenuItem } from './menu';
import type { UserInfo } from './user';

export interface LoginForm {
  username: string;
  password: string;
  captchaKey: string;
  captchaText: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  token: string;
  userInfo: UserInfo;
}

export interface CaptchaResult {
  key: string;
  img?: string;
  svg?: string;
  expireAt?: number;
}

export interface AuthUserInfo {
  user: UserInfo;
  roles: string[];
  permissions: string[];
  menus: MenuItem[];
}

export interface JwtUser {
  userId: Id;
  tenantId: Id | null;
  username: string;
}
