import type { Id } from './api';

export interface MenuMeta {
  title: string;
  icon?: string;
  perm?: string;
  hidden?: boolean;
  keepAlive?: boolean;
}

export interface MenuTreeItem {
  id: Id;
  parentId?: Id | null;
  name: string;
  path: string;
  component?: string;
  meta: MenuMeta;
  children?: MenuTreeItem[];
}
