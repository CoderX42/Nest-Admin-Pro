import { requestClient } from '#/api/request';

// ==================== 用户管理 ====================
export namespace UserManagementApi {
  export interface UserItem {
    avatar?: string;
    createTime: string;
    dept?: { id: number; name: string };
    deptId?: number;
    email?: string;
    id: number;
    isDelete?: number;
    nickname: string;
    phone?: string;
    postIds?: string;
    remark?: string;
    roles: { code: string; id: number; name: string }[];
    status: number;
    updateTime: string;
    username: string;
  }

  export interface UserListResult {
    items: UserItem[];
    total: number;
  }

  export interface QueryParams {
    deptId?: number;
    limit?: number;
    nickname?: string;
    page?: number;
    status?: number;
    username?: string;
  }

  export interface CreateUserParams {
    deptId?: number;
    email?: string;
    nickname?: string;
    password: string;
    phone?: string;
    postIds?: number[];
    remark?: string;
    status?: number;
    username: string;
  }

  export interface UpdateUserParams extends CreateUserParams {
    id: number;
  }
}

export const userListApi = (params: UserManagementApi.QueryParams) =>
  requestClient.get<UserManagementApi.UserListResult>('/system/user/list', {
    params,
  });

export const userDetailApi = (id: number) =>
  requestClient.get(`/system/user/${id}`);

export const userCreateApi = (data: UserManagementApi.CreateUserParams) =>
  requestClient.post('/system/user', data);

export const userUpdateApi = (data: UserManagementApi.UpdateUserParams) =>
  requestClient.put('/system/user', data);

export const userDeleteApi = (id: number) =>
  requestClient.delete(`/system/user/${id}`);

export const userResetPasswordApi = (id: number) =>
  requestClient.put(`/system/user/reset-password/${id}`);

export const userChangeStatusApi = (id: number, status: number) =>
  requestClient.put(`/system/user/change-status/${id}`, { status });

export const userAssignRolesApi = (id: number, roleIds: number[]) =>
  requestClient.put(`/system/user/assign-roles/${id}`, { roleIds });

// ==================== 角色管理 ====================
export namespace RoleApi {
  export interface RoleItem {
    code: string;
    createTime: string;
    dataScope: number;
    deptIds?: string;
    id: number;
    menuIds?: string;
    name: string;
    remark?: string;
    status: number;
    updateTime: string;
  }

  export interface QueryParams {
    code?: string;
    limit?: number;
    name?: string;
    page?: number;
    status?: number;
  }

  export interface ListResult {
    items: RoleItem[];
    total: number;
  }

  export interface CreateParams {
    code: string;
    dataScope?: number;
    deptIds?: number[];
    menuIds?: number[];
    name: string;
    remark?: string;
    status?: number;
  }

  export interface UpdateParams extends CreateParams {
    id: number;
  }
}

export const roleListApi = (params: RoleApi.QueryParams) =>
  requestClient.get<RoleApi.ListResult>('/system/role/list', { params });

export const roleDetailApi = (id: number) =>
  requestClient.get(`/system/role/${id}`);

export const roleCreateApi = (data: RoleApi.CreateParams) =>
  requestClient.post('/system/role', data);

export const roleUpdateApi = (data: RoleApi.UpdateParams) =>
  requestClient.put('/system/role', data);

export const roleDeleteApi = (id: number) =>
  requestClient.delete(`/system/role/${id}`);

export const roleChangeStatusApi = (id: number, status: number) =>
  requestClient.put(`/system/role/change-status/${id}`, { status });

export const roleAssignPermissionsApi = (
  id: number,
  menuIds: number[],
  deptIds?: number[],
) =>
  requestClient.put(`/system/role/assign-permissions/${id}`, {
    menuIds,
    deptIds,
  });

export const roleMenusApi = (id: number) =>
  requestClient.get<number[]>(`/system/role/menu/${id}`);

// ==================== 菜单管理 ====================
export namespace MenuApi {
  export interface MenuItem {
    children?: MenuItem[];
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

  export interface CreateParams {
    component?: string;
    icon?: string;
    keepAlive?: number;
    name: string;
    parentId: number;
    path?: string;
    perms?: string;
    show?: number;
    sort?: number;
    status?: number;
    type: number;
  }

  export interface UpdateParams extends CreateParams {
    id: number;
  }
}

export const menuListApi = () => requestClient.get<MenuApi.MenuItem[]>('/system/menu/list');

export const menuTreeApi = () => requestClient.get<MenuApi.MenuItem[]>('/system/menu/tree');

export const menuDetailApi = (id: number) =>
  requestClient.get(`/system/menu/${id}`);

export const menuCreateApi = (data: MenuApi.CreateParams) =>
  requestClient.post('/system/menu', data);

export const menuUpdateApi = (data: MenuApi.UpdateParams) =>
  requestClient.put('/system/menu', data);

export const menuDeleteApi = (id: number) =>
  requestClient.delete(`/system/menu/${id}`);

// ==================== 部门管理 ====================
export namespace DeptApi {
  export interface DeptItem {
    children?: DeptItem[];
    createTime: string;
    id: number;
    leaderId?: number;
    name: string;
    parentId: number;
    sort: number;
    status: number;
    updateTime: string;
  }

  export interface CreateParams {
    leaderId?: number;
    name: string;
    parentId: number;
    sort?: number;
    status?: number;
  }

  export interface UpdateParams extends CreateParams {
    id: number;
  }
}

export const deptListApi = () => requestClient.get<DeptApi.DeptItem[]>('/system/dept/list');

export const deptTreeApi = () => requestClient.get<DeptApi.DeptItem[]>('/system/dept/tree');

export const deptDetailApi = (id: number) =>
  requestClient.get(`/system/dept/${id}`);

export const deptCreateApi = (data: DeptApi.CreateParams) =>
  requestClient.post('/system/dept', data);

export const deptUpdateApi = (data: DeptApi.UpdateParams) =>
  requestClient.put('/system/dept', data);

export const deptDeleteApi = (id: number) =>
  requestClient.delete(`/system/dept/${id}`);

// ==================== 岗位管理 ====================
export namespace PostApi {
  export interface PostItem {
    code: string;
    createTime: string;
    id: number;
    name: string;
    remark?: string;
    sort: number;
    status: number;
    updateTime: string;
  }

  export interface CreateParams {
    code: string;
    name: string;
    remark?: string;
    sort?: number;
    status?: number;
  }

  export interface UpdateParams extends CreateParams {
    id: number;
  }
}

export const postListApi = (params?: { name?: string; status?: number }) =>
  requestClient.get<{ items: PostApi.PostItem[]; total: number }>(
    '/system/post/list',
    { params },
  );

export const postDetailApi = (id: number) =>
  requestClient.get(`/system/post/${id}`);

export const postCreateApi = (data: PostApi.CreateParams) =>
  requestClient.post('/system/post', data);

export const postUpdateApi = (data: PostApi.UpdateParams) =>
  requestClient.put('/system/post', data);

export const postDeleteApi = (id: number) =>
  requestClient.delete(`/system/post/${id}`);

// ==================== 字典管理 ====================
export namespace DictApi {
  export interface DictType {
    code: string;
    createTime: string;
    id: number;
    name: string;
    remark?: string;
    status: number;
    updateTime: string;
  }

  export interface DictData {
    createTime: string;
    dictTypeId: number;
    id: number;
    label: string;
    remark?: string;
    sort: number;
    status: number;
    updateTime: string;
    value: string;
  }
}

export const dictTypeListApi = (params?: { code?: string; name?: string }) =>
  requestClient.get<{ items: DictApi.DictType[]; total: number }>(
    '/system/dict/type/list',
    { params },
  );

export const dictTypeDetailApi = (id: number) =>
  requestClient.get(`/system/dict/type/${id}`);

export const dictTypeCreateApi = (data: Omit<DictApi.DictType, 'id' | 'createTime' | 'updateTime'>) =>
  requestClient.post('/system/dict/type', data);

export const dictTypeUpdateApi = (
  data: Omit<DictApi.DictType, 'createTime' | 'updateTime'>,
) => requestClient.put('/system/dict/type', data);

export const dictTypeDeleteApi = (id: number) =>
  requestClient.delete(`/system/dict/type/${id}`);

export const dictDataListApi = (dictTypeId: number) =>
  requestClient.get<DictApi.DictData[]>(`/system/dict/data/list`, {
    params: { dictTypeId },
  });

export const dictDataCreateApi = (data: Omit<DictApi.DictData, 'id' | 'createTime' | 'updateTime'>) =>
  requestClient.post('/system/dict/data', data);

export const dictDataUpdateApi = (
  data: Omit<DictApi.DictData, 'createTime' | 'updateTime'>,
) => requestClient.put('/system/dict/data', data);

export const dictDataDeleteApi = (id: number) =>
  requestClient.delete(`/system/dict/data/${id}`);

// ==================== 参数配置 ====================
export namespace ConfigApi {
  export interface ConfigItem {
    createTime: string;
    id: number;
    key: string;
    name: string;
    remark?: string;
    status: number;
    type: string;
    updateTime: string;
    value: string;
  }

  export interface CreateParams {
    key: string;
    name: string;
    remark?: string;
    status?: number;
    type?: string;
    value: string;
  }

  export interface UpdateParams extends CreateParams {
    id: number;
  }
}

export const configListApi = (params?: { key?: string; name?: string }) =>
  requestClient.get<{ items: ConfigApi.ConfigItem[]; total: number }>(
    '/system/config/list',
    { params },
  );

export const configDetailApi = (id: number) =>
  requestClient.get(`/system/config/${id}`);

export const configByKeyApi = (key: string) =>
  requestClient.get(`/system/config/key/${key}`);

export const configCreateApi = (data: ConfigApi.CreateParams) =>
  requestClient.post('/system/config', data);

export const configUpdateApi = (data: ConfigApi.UpdateParams) =>
  requestClient.put('/system/config', data);

export const configDeleteApi = (id: number) =>
  requestClient.delete(`/system/config/${id}`);

export const configRefreshApi = () => requestClient.put('/system/config/refresh');

// ==================== 通知公告 ====================
export namespace NoticeApi {
  export interface NoticeItem {
    content: string;
    createTime: string;
    id: number;
    publishTime?: string;
    status: number;
    title: string;
    type: number;
    updateTime: string;
  }

  export interface CreateParams {
    content: string;
    publishTime?: string;
    status?: number;
    title: string;
    type: number;
  }

  export interface UpdateParams extends CreateParams {
    id: number;
  }
}

export const noticeListApi = (params?: { title?: string; type?: number }) =>
  requestClient.get<{ items: NoticeApi.NoticeItem[]; total: number }>(
    '/system/notice/list',
    { params },
  );

export const noticeDetailApi = (id: number) =>
  requestClient.get(`/system/notice/${id}`);

export const noticeCreateApi = (data: NoticeApi.CreateParams) =>
  requestClient.post('/system/notice', data);

export const noticeUpdateApi = (data: NoticeApi.UpdateParams) =>
  requestClient.put('/system/notice', data);

export const noticeDeleteApi = (id: number) =>
  requestClient.delete(`/system/notice/${id}`);