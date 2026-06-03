import type { Id } from './api';

export type RoleStatus = 0 | 1;
export type DataScope = 1 | 2 | 3 | 4 | 5;

export interface SysRole {
  id: Id;
  tenantId: Id | null;
  name: string;
  code: string;
  sort: number;
  status: RoleStatus;
  dataScope: DataScope;
  menuIds?: Id[];
  deptIds?: Id[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleQuery {
  name?: string;
  code?: string;
  status?: RoleStatus;
}

export interface CreateRoleDto {
  name: string;
  code: string;
  sort: number;
  status: RoleStatus;
  dataScope: DataScope;
  menuIds?: Id[];
  deptIds?: Id[];
}

export interface UpdateRoleDto extends CreateRoleDto {
  id: Id;
}
