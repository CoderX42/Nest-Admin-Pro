import type { ApiResponse } from '@nest-admin-pro/shared-types';

import { BASE_URL } from './env';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  url: string;
  method?: Method;
  data?: unknown;
  params?: Record<string, unknown>;
  header?: Record<string, string>;
  silent?: boolean;
  noAuth?: boolean;
}

interface UploadOptions {
  url: string;
  filePath: string;
  name?: string;
  formData?: Record<string, unknown>;
  header?: Record<string, string>;
  silent?: boolean;
  noAuth?: boolean;
}

let isHandling401 = false;

function getToken() {
  return uni.getStorageSync('nap_token') || uni.getStorageSync('token') || '';
}

function clearToken() {
  uni.removeStorageSync('nap_token');
  uni.removeStorageSync('token');
}

function buildHeader(options: Pick<RequestOptions, 'header' | 'noAuth'>) {
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  };
  const token = getToken();
  if (token && !options.noAuth) {
    header.Authorization = `Bearer ${token}`;
  }
  return header;
}

function buildUrl(url: string, params?: Record<string, unknown>) {
  const base = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const query = params ? stringifyQuery(params) : '';
  return query ? `${base}?${query}` : base;
}

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(options.url, options.params),
      method: options.method ?? 'GET',
      data: options.data as UniApp.RequestOptions['data'],
      header: buildHeader(options),
      timeout: 30_000,
      success: (response) => {
        const status = response.statusCode;
        const body = response.data as ApiResponse<T>;

        if (status === 401) {
          handle401(options.silent);
          reject(new Error('Unauthorized'));
          return;
        }
        if (status >= 400) {
          const message = body?.message || `网络异常 ${status}`;
          showError(message, options.silent);
          reject(new Error(message));
          return;
        }
        if (body.code === 200) {
          resolve(body.data);
          return;
        }

        const message = body.message ?? '请求失败';
        showError(message, options.silent);
        reject(new Error(message));
      },
      fail: (error) => {
        showError('网络连接失败', options.silent);
        reject(error);
      },
    });
  });
}

export function upload<T = unknown>(options: UploadOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: buildUrl(options.url),
      filePath: options.filePath,
      name: options.name ?? 'file',
      formData: options.formData,
      header: buildHeader(options),
      success: (response) => {
        const body = JSON.parse(response.data) as ApiResponse<T>;
        if (response.statusCode === 401) {
          handle401(options.silent);
          reject(new Error('Unauthorized'));
          return;
        }
        if (response.statusCode >= 400) {
          const message = body?.message || `网络异常 ${response.statusCode}`;
          showError(message, options.silent);
          reject(new Error(message));
          return;
        }
        if (body.code === 200) {
          resolve(body.data);
          return;
        }
        const message = body.message ?? '上传失败';
        showError(message, options.silent);
        reject(new Error(message));
      },
      fail: (error) => {
        showError('网络连接失败', options.silent);
        reject(error);
      },
    });
  });
}

function handle401(silent?: boolean) {
  if (isHandling401) return;
  isHandling401 = true;
  clearToken();
  showError('登录已过期', silent);
  setTimeout(() => {
    isHandling401 = false;
    uni.reLaunch({ url: '/pages/login/index' });
  }, 800);
}

function showError(message: string, silent?: boolean) {
  if (!silent) {
    uni.showToast({ title: message, icon: 'none' });
  }
}

function stringifyQuery(params: Record<string, unknown>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

export const get = <T = unknown>(url: string, params?: Record<string, unknown>) =>
  request<T>({ url, method: 'GET', params });

export const post = <T = unknown>(url: string, data?: unknown) =>
  request<T>({ url, method: 'POST', data });

export const put = <T = unknown>(url: string, data?: unknown) =>
  request<T>({ url, method: 'PUT', data });

export const del = <T = unknown>(url: string, data?: unknown) =>
  request<T>({ url, method: 'DELETE', data });
