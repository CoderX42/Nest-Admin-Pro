export type { ApiResponse, ErrorCode, Id, PageQuery, PageResult } from '@nest-admin-pro/shared-types';

export interface OptionItem<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}
