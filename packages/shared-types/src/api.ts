export type Id = string;

export type ErrorCode = 200 | 400 | 401 | 403 | 404 | 429 | 500;

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
