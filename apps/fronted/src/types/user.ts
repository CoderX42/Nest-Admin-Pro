import type { Id } from './api';

export type UserStatus = 0 | 1;

export interface UserInfo {
  id: Id;
  tenantId: Id | null;
  deptId?: Id | null;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  remark?: string;
  deptName?: string;
  roles: string[];
}

export interface SysUser extends UserInfo {
  status: UserStatus;
  roleIds?: Id[];
  postIds?: Id[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserQuery {
  username?: string;
  phone?: string;
  status?: UserStatus;
  deptId?: Id;
}

export interface CreateUserDto {
  username: string;
  nickname: string;
  password: string;
  deptId?: Id | null;
  roleIds?: Id[];
  postIds?: Id[];
  email?: string;
  phone?: string;
  remark?: string;
}

export interface UpdateUserDto extends Omit<CreateUserDto, 'password'> {
  id: Id;
  status?: UserStatus;
}
