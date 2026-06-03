import type { Id } from './api';

export interface UserProfile {
  id: Id;
  username: string;
  nickname: string;
  avatar?: string;
  tenantId?: Id | null;
  tenantName?: string | null;
  roles: string[];
  permissions: string[];
}

export interface LoginResult {
  token: string;
  userInfo: UserProfile;
}
