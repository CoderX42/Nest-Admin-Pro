import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import type { ApiResponse } from '@/types/api';

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

service.interceptors.request.use((config) => {
  const userStore = useUserStore();
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`;
  }
  return config;
});

let isRefreshing401 = false;

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (response.config.responseType === 'blob') {
      return response;
    }

    const { code, data, message } = response.data;
    if (code === 200) {
      return data;
    }

    ElMessage.error(message ?? '请求失败');
    return Promise.reject(response);
  },
  async (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status;

    if (status === 401) {
      if (isRefreshing401) {
        return Promise.reject(error);
      }
      isRefreshing401 = true;
      try {
        const userStore = useUserStore();
        userStore.reset();
        await ElMessageBox.alert('登录已过期,请重新登录', '提示', { type: 'warning' });
        window.location.href = '/login';
      } finally {
        isRefreshing401 = false;
      }
    } else if (status === 403) {
      ElMessage.error('权限不足');
    } else if (status === 429) {
      ElMessage.error('请求过于频繁,稍后再试');
    } else if (typeof status === 'number' && status >= 500) {
      ElMessage.error('服务器异常,请稍后再试');
    } else {
      ElMessage.error(error.response?.data?.message ?? error.message ?? '请求失败');
    }

    return Promise.reject(error);
  },
);

export function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  return service.request<unknown, T>(config);
}

export default service;
