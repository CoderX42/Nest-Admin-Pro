export type { ApiResponse, ErrorCode, Id, PageResult } from '@nest-admin-pro/shared-types';

export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface OptionItem<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}
