import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import type { MenuItem } from '@/types/menu';

function toRouteName(path: string) {
  return path
    .split(/[/-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function buildRoutes(menus: MenuItem[]): RouteRecordRaw[] {
  return menus
    .filter((menu) => menu.type !== 3)
    .map((menu) => ({
      path: menu.path?.startsWith('/') ? menu.path : `/${menu.path ?? String(menu.id)}`,
      name: toRouteName(menu.path ?? menu.name),
      component: menu.component === 'Layout' || !menu.component ? undefined : undefined,
      meta: {
        title: menu.name,
        i18nKey: menu.i18nKey,
        icon: menu.icon,
        keepAlive: menu.isCache === 1,
        hidden: menu.isVisible === 0,
        perms: menu.perms,
      },
      children: menu.children?.length ? buildRoutes(menu.children) : undefined,
    }));
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const menus = ref<MenuItem[]>([]);

  async function generateRoutes(menuItems: MenuItem[]) {
    menus.value = menuItems;
    routes.value = buildRoutes(menuItems);
    return routes.value;
  }

  function reset() {
    routes.value = [];
    menus.value = [];
  }

  return {
    routes,
    menus,
    generateRoutes,
    reset,
  };
});
