import type { Id } from './api';

export interface DictType {
  id: Id;
  name: string;
  code: string;
  status: number;
  remark?: string | null;
}

export interface DictItem {
  id: Id;
  dictTypeId: Id;
  label: string;
  value: string;
  sort: number;
  status: number;
  remark?: string | null;
}
