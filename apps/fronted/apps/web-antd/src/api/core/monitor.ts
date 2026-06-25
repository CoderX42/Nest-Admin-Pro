import { requestClient } from '#/api/request';

// ==================== 登录日志 ====================
export namespace LoginLogApi {
  export interface LoginLogItem {
    browser?: string;
    createTime: string;
    id: number;
    ip: string;
    location?: string;
    msg?: string;
    os?: string;
    status: number;
    userId?: number;
    username: string;
  }
}

export const loginLogListApi = (params?: {
  limit?: number;
  page?: number;
  status?: number;
  username?: string;
}) =>
  requestClient.get<{ items: LoginLogApi.LoginLogItem[]; total: number }>(
    '/monitor/login-log/list',
    { params },
  );

export const loginLogDetailApi = (id: number) =>
  requestClient.get(`/monitor/login-log/${id}`);

export const loginLogCleanApi = () =>
  requestClient.delete('/monitor/login-log/clean');

// ==================== 操作日志 ====================
export namespace OperLogApi {
  export interface OperLogItem {
    createTime: string;
    duration?: number;
    errorMsg?: string;
    id: number;
    ip?: string;
    location?: string;
    method?: string;
    module?: string;
    reqMethod?: string;
    reqParam?: string;
    reqUrl: string;
    respResult?: string;
    status: number;
    userId?: number;
    username: string;
  }
}

export const operLogListApi = (params?: any) =>
  requestClient.get<{ items: OperLogApi.OperLogItem[]; total: number }>(
    '/monitor/oper-log/list',
    { params },
  );

export const operLogDetailApi = (id: number) =>
  requestClient.get(`/monitor/oper-log/${id}`);

export const operLogCleanApi = () =>
  requestClient.delete('/monitor/oper-log/clean');

// ==================== 在线用户 ====================
export interface OnlineUser {
  browser?: string;
  ip?: string;
  loginTime: string;
  os?: string;
  token: string;
  username: string;
}

export const onlineUserListApi = () =>
  requestClient.get<OnlineUser[]>('/monitor/online/list');

export const forceLogoutApi = (token: string) =>
  requestClient.post(`/monitor/online/force-logout/${encodeURIComponent(token)}`);

// ==================== 服务监控 ====================
export interface ServerInfo {
  cpuCount: number;
  cpuUsage: string;
  hostname: string;
  mem: {
    free: string;
    total: string;
    usage: string;
    used: string;
  };
  os: string;
  uptime: string;
}

export const serverInfoApi = () =>
  requestClient.get<ServerInfo>('/monitor/server/info');

// ==================== 缓存监控 ====================
export interface CacheInfo {
  // Redis 服务器信息字段，取决于后端具体返回结构
  [key: string]: any;
}

export interface CacheKey {
  key: string;
  ttl: number;
  type: string;
}

export const cacheInfoApi = () =>
  requestClient.get<CacheInfo>('/monitor/cache/info');

export const cacheKeysApi = (pattern?: string) =>
  requestClient.get<CacheKey[]>('/monitor/cache/keys', {
    params: { pattern: pattern ?? '*' },
  });

export const cacheValueApi = (key: string) =>
  requestClient.get('/monitor/cache/value', { params: { key } });

export const cacheClearApi = () =>
  requestClient.post('/monitor/cache/clear');

export const cacheDeleteApi = (key: string) =>
  requestClient.post('/monitor/cache/delete', null, { params: { key } });