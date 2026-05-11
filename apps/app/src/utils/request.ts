const BASE_URL = 'http://localhost:3000/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}

export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.header,
    };
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        const data = res.data as any;
        if (data.code === 200) {
          resolve(data.data);
        } else {
          if (data.code === 401) {
            uni.removeStorageSync('token');
            uni.reLaunch({ url: '/pages/login/index' });
          }
          uni.showToast({ title: data.message || 'Request failed', icon: 'none' });
          reject(data);
        }
      },
      fail: (err) => {
        uni.showToast({ title: 'Network error', icon: 'none' });
        reject(err);
      },
    });
  });
}

export const get = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: 'GET', data });

export const post = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: 'POST', data });

export const put = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: 'PUT', data });

export const del = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: 'DELETE', data });