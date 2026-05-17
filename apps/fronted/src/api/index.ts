import request from '../utils/request';

// Auth API
export const authApi = {
  login: (data: { username: string; password: string; captchaKey: string; captchaText: string }) =>
    request.post('/auth/login', data),
  register: (data: { username: string; password: string; nickname?: string }) => request.post('/auth/register', data),
  captcha: () => request.get('/auth/captcha'),
  validateCaptcha: (key: string, text: string) => request.post('/auth/captcha/validate', { key, text }),
  logout: () => request.post('/auth/logout'),
  getUserInfo: () => request.get('/auth/user/info'),
};

// System User API
export const userApi = {
  list: (params: any) => request.get('/system/user/list', { params }),
  findOne: (id: number) => request.get(`/system/user/${id}`),
  create: (data: any) => request.post('/system/user', data),
  update: (data: any) => request.put('/system/user', data),
  delete: (id: number) => request.delete(`/system/user/${id}`),
  resetPassword: (id: number) => request.put(`/system/user/reset-password/${id}`),
  changeStatus: (id: number, status: number) => request.put(`/system/user/change-status/${id}`, { status }),
  assignRoles: (id: number, roleIds: number[]) => request.put(`/system/user/assign-roles/${id}`, { roleIds }),
};

// System Role API
export const roleApi = {
  list: (params: any) => request.get('/system/role/list', { params }),
  findOne: (id: number) => request.get(`/system/role/${id}`),
  create: (data: any) => request.post('/system/role', data),
  update: (data: any) => request.put('/system/role', data),
  delete: (id: number) => request.delete(`/system/role/${id}`),
  changeStatus: (id: number, status: number) => request.put(`/system/role/change-status/${id}`, { status }),
  assignPermissions: (id: number, menuIds: string[], deptIds?: string[]) =>
    request.put(`/system/role/assign-permissions/${id}`, { menuIds, deptIds }),
  getRoleMenus: (id: number) => request.get(`/system/role/menu/${id}`),
};

// System Dept API
export const deptApi = {
  list: (params?: any) => request.get('/system/dept/list', { params }),
  tree: () => request.get('/system/dept/tree'),
  findOne: (id: number) => request.get(`/system/dept/${id}`),
  create: (data: any) => request.post('/system/dept', data),
  update: (data: any) => request.put('/system/dept', data),
  delete: (id: number) => request.delete(`/system/dept/${id}`),
};

// System Menu API
export const menuApi = {
  list: (params?: any) => request.get('/system/menu/list', { params }),
  tree: () => request.get('/system/menu/tree'),
  buildRoute: (userId: number) => request.get('/system/menu/build-route', { params: { userId } }),
  findOne: (id: number) => request.get(`/system/menu/${id}`),
  create: (data: any) => request.post('/system/menu', data),
  update: (data: any) => request.put('/system/menu', data),
  delete: (id: number) => request.delete(`/system/menu/${id}`),
};

// System Post API
export const postApi = {
  list: (params?: any) => request.get('/system/post/list', { params }),
  findOne: (id: number) => request.get(`/system/post/${id}`),
  create: (data: any) => request.post('/system/post', data),
  update: (data: any) => request.put('/system/post', data),
  delete: (id: number) => request.delete(`/system/post/${id}`),
};

// System Dict API
export const dictApi = {
  typeList: (params?: any) => request.get('/system/dict/type/list', { params }),
  typeFindOne: (id: number) => request.get(`/system/dict/type/${id}`),
  typeCreate: (data: any) => request.post('/system/dict/type', data),
  typeUpdate: (data: any) => request.put('/system/dict/type', data),
  typeDelete: (id: number) => request.delete(`/system/dict/type/${id}`),
  dataList: (dictTypeId: number) => request.get('/system/dict/data/list', { params: { dictTypeId } }),
  dataCreate: (data: any) => request.post('/system/dict/data', data),
  dataUpdate: (data: any) => request.put('/system/dict/data', data),
  dataDelete: (id: number) => request.delete(`/system/dict/data/${id}`),
};

// System Config API
export const configApi = {
  list: (params?: any) => request.get('/system/config/list', { params }),
  findOne: (id: number) => request.get(`/system/config/${id}`),
  findByKey: (key: string) => request.get(`/system/config/key/${key}`),
  create: (data: any) => request.post('/system/config', data),
  update: (data: any) => request.put('/system/config', data),
  delete: (id: number) => request.delete(`/system/config/${id}`),
  refresh: () => request.put('/system/config/refresh'),
};

// System Notice API
export const noticeApi = {
  list: (params?: any) => request.get('/system/notice/list', { params }),
  findOne: (id: number) => request.get(`/system/notice/${id}`),
  create: (data: any) => request.post('/system/notice', data),
  update: (data: any) => request.put('/system/notice', data),
  delete: (id: number) => request.delete(`/system/notice/${id}`),
};

// Monitor APIs
export const loginLogApi = {
  list: (params?: any) => request.get('/monitor/login-log/list', { params }),
  clean: () => request.delete('/monitor/login-log/clean'),
};

export const operLogApi = {
  list: (params?: any) => request.get('/monitor/oper-log/list', { params }),
  clean: () => request.delete('/monitor/oper-log/clean'),
};

export const onlineApi = {
  list: () => request.get('/monitor/online/list'),
  forceLogout: (token: string) => request.post(`/monitor/online/force-logout/${token}`),
};

export const serverApi = {
  info: () => request.get('/monitor/server/info'),
};

export const cacheApi = {
  info: () => request.get('/monitor/cache/info'),
  keys: (pattern?: string) => request.get('/monitor/cache/keys', { params: { pattern } }),
  value: (key: string) => request.get('/monitor/cache/value', { params: { key } }),
  clear: () => request.post('/monitor/cache/clear'),
  delete: (key: string) => request.post('/monitor/cache/delete', null, { params: { key } }),
};

// Profile API
export const profileApi = {
  getProfile: () => request.get('/auth/profile'),
  updateProfile: (data: any) => request.put('/auth/profile', data),
  updatePassword: (data: { oldPassword: string; newPassword: string }) => request.put('/auth/profile/password', data),
};

// File API
export const fileApi = {
  upload: (formData: FormData) =>
    request.post('/file/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadImage: (formData: FormData) =>
    request.post('/file/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};