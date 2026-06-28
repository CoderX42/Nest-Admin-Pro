import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    captchaKey: string;
    captchaText: string;
    password?: string;
    username?: string;
  }

  /** 登录接口返回值（与后端约定） */
  export interface LoginResult {
    token: string;
    userInfo: {
      avatar: string;
      deptName?: string;
      email: string;
      id: number;
      nickname: string;
      phone: string;
      roles: string[];
      username: string;
    };
  }

  /** 验证码返回值 */
  export interface CaptchaResult {
    img: string;
    key: string;
  }

  /** 当前用户信息（与后端约定） */
  export interface UserInfoResult {
    menus: RouteMenuItem[];
    permissions: string[];
    user: {
      avatar: string;
      deptName?: string;
      email: string;
      id: number;
      nickname: string;
      phone: string;
      roles: string[];
      username: string;
    };
  }

  /** 后端菜单结构 */
  export interface RouteMenuItem {
    children?: RouteMenuItem[];
    component?: string;
    icon?: string;
    id: number;
    keepAlive?: number;
    name: string;
    parentId: number;
    path?: string;
    perms?: string;
    show?: number;
    sort: number;
    status: number;
    type: number;
  }
}

/**
 * 获取图形验证码
 */
export async function getCaptchaApi() {
  return baseRequestClient.get<AuthApi.CaptchaResult>('/auth/captcha');
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout');
}

/**
 * 获取当前用户信息（包含菜单与权限）
 */
export async function getUserInfoApi() {
  return requestClient.get<AuthApi.UserInfoResult>('/auth/user/info');
}

/**
 * 获取用户权限码
 * 通过用户信息中的 permissions 字段获取（兼容原有 vben-admin 调用方式）
 */
export async function getAccessCodesApi(): Promise<string[]> {
  const info = await getUserInfoApi();
  return info.permissions ?? [];
}