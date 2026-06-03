import type { Id } from './api';

export type MenuType = 1 | 2 | 3;
export type VisibleStatus = 0 | 1;

export interface MenuItem {
  id: Id;
  parentId: Id | null;
  name: string;
  type: MenuType;
  path?: string;
  component?: string;
  icon?: string;
  perms?: string;
  sort?: number;
  isVisible?: VisibleStatus;
  isCache?: VisibleStatus;
  i18nKey?: string;
  children?: MenuItem[];
}

export interface MenuQuery {
  name?: string;
  status?: VisibleStatus;
}
