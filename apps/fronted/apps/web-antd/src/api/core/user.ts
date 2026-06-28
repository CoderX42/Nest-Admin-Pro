import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

import { getUserInfoApi as fetchUserInfoApi } from './auth';

/**
 * 获取当前登录用户信息（适配 vben-admin UserInfo 形状）
 */
export async function getUserInfoApi(): Promise<UserInfo> {
  const data = await fetchUserInfoApi();
  const u = data.user;
  return {
    userId: String(u.id),
    username: u.username,
    realName: u.nickname,
    avatar: u.avatar,
    desc: u.deptName ?? '',
    email: u.email,
    phone: u.phone,
    roles: u.roles,
    homePath: '/dashboard/analytics',
    token: '',
  };
}

export namespace UserApi {
  export interface Profile {
    avatar: string;
    deptName?: string;
    email: string;
    id: number;
    nickname: string;
    phone: string;
    posts: { id: number; name: string }[];
    remark?: string;
    roles: { code: string; id: number; name: string }[];
    status: number;
    username: string;
  }

  export interface UpdateProfileParams {
    avatar?: string;
    email?: string;
    nickname?: string;
    phone?: string;
    remark?: string;
  }

  export interface UpdatePasswordParams {
    newPassword: string;
    oldPassword: string;
  }
}

/**
 * 获取个人资料
 */
export async function getProfileApi() {
  return requestClient.get<UserApi.Profile>('/auth/profile');
}

/**
 * 更新个人资料
 */
export async function updateProfileApi(data: UserApi.UpdateProfileParams) {
  return requestClient.put('/auth/profile', data);
}

/**
 * 修改密码
 */
export async function updatePasswordApi(data: UserApi.UpdatePasswordParams) {
  return requestClient.put('/auth/profile/password', data);
}