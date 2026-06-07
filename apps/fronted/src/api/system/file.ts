import { request } from '@/utils/request';
import type { Id } from '@/types/api';

export interface UploadResult {
  url: string;
  filename?: string;
}

export const fileApi = {
  upload: (formData: FormData) =>
    request<UploadResult>({
      url: '/system/file/upload',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadImage: (formData: FormData) =>
    request<UploadResult>({
      url: '/system/file/upload-image',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const fileConfigApi = {
  get: () => request<unknown>({ url: '/system/file/config', method: 'get' }),
  update: (data: unknown) => request<unknown>({ url: '/system/file/config', method: 'put', data }),
};

export const fileManageApi = {
  list: (params?: Record<string, unknown>) =>
    request<unknown>({ url: '/system/file/list', method: 'get', params }),
  detail: (id: Id) => request<unknown>({ url: `/system/file/detail/${id}`, method: 'get' }),
  delete: (id: Id) => request<void>({ url: `/system/file/${id}`, method: 'delete' }),
};
