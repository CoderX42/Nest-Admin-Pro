import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

import { getUserInfoApi as fetchUserInfoApi, type RouteMenuItem } from './auth';

/**
 * 将后端菜单树转换为 vben-admin 路由可消费的菜单格式。
 * 后端菜单结构：
 *   { id, name, type(1目录/2菜单/3按钮), parentId, path, component, icon, sort, perms, status, children }
 * vben-admin 期望的结构（generateAccessible）：
 *   { id, name, path, component, meta: { title, icon, order, affixTab, keepAlive, hideInMenu, authority } }
 */
function convertMenu(menu: RouteMenuItem): RouteRecordStringComponent | null {
  if (menu.status !== 1) return null;

  // 按钮类型不进路由
  if (menu.type === 3) return null;

  const isCatalog = menu.type === 1;
  const item: any = {
    id: String(menu.id),
    name: menu.name,
    path: menu.path ?? '',
    meta: {
      title: menu.name,
      icon: menu.icon ? `ant-design:${kebabToCamel(menu.icon)}-outlined` : undefined,
      order: menu.sort ?? 0,
      keepAlive: menu.keepAlive === 1,
      hideInMenu: isCatalog ? false : menu.show === 0,
      authority: menu.perms ? [menu.perms] : undefined,
    },
  };

  if (!isCatalog && menu.component) {
    // component 形如 "system/user/index"，转换为 "#/views/system/user/index"
    const comp = menu.component.startsWith('/')
      ? menu.component.slice(1)
      : menu.component;
    item.component = comp;
  }

  if (Array.isArray(menu.children) && menu.children.length > 0) {
    const children = menu.children
      .map(convertMenu)
      .filter((c): c is RouteRecordStringComponent => c !== null);
    if (children.length > 0) {
      item.children = children;
    }
  }

  return item as RouteRecordStringComponent;
}

function kebabToCamel(name: string): string {
  // 'Setting' -> 'setting'
  // 'FolderOpened' -> 'folder-opened'
  return name.replace(/([A-Z])/g, (m, _, idx) =>
    idx === 0 ? m.toLowerCase() : `-${m.toLowerCase()}`,
  );
}

/**
 * 获取当前用户所有菜单
 */
export async function getAllMenusApi(): Promise<RouteRecordStringComponent[]> {
  const info = await fetchUserInfoApi();
  const menus = info.menus ?? [];
  return menus
    .map(convertMenu)
    .filter((m): m is RouteRecordStringComponent => m !== null);
}

// 重新导出，避免外部 import 不到
export { getUserInfoApi } from './auth';