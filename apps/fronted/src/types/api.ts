export type Id = string;

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  timestamp?: number;
  errors?: string[];
}

export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface OptionItem<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}
