import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Router, RouteComponent, RouteRecordRaw } from 'vue-router';

import type { MenuItem } from '@/types/menu';

const viewModules = import.meta.glob('../../views/**/*.vue');
const FALLBACK_VIEW = '../../views/dashboard/index.vue';
const ROOT_ROUTE_NAME = 'RootLayout';
const STATIC_ROUTE_NAMES = new Set(['Dashboard', 'Profile']);
const STATIC_ROUTE_PATHS = new Set(['/dashboard', '/profile']);

function pascalCase(value: string) {
  return value
    .split(/[/:_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function normalizeChildPath(path: string | undefined, fallback: string) {
  if (!path) return fallback;
  return path.startsWith('/') ? path.slice(1) : path;
}

function resolveFullPath(menu: MenuItem, parentPath = '') {
  const rawPath = menu.path ?? String(menu.id);
  if (rawPath.startsWith('/')) return rawPath;
  const prefix = parentPath === '/' ? '' : parentPath;
  return `${prefix}/${rawPath}`.replace(/\/+/g, '/');
}

function resolveComponent(menu: MenuItem): RouteComponent {
  const componentPath = menu.component ? `../../views/${menu.component}.vue` : FALLBACK_VIEW;
  return (viewModules[componentPath] ?? viewModules[FALLBACK_VIEW]) as RouteComponent;
}

function buildRoutes(menus: MenuItem[], parentPath = ''): RouteRecordRaw[] {
  return menus.reduce<RouteRecordRaw[]>((result, menu) => {
    if (menu.type === 3) return result;

    const fullPath = resolveFullPath(menu, parentPath);
    if (STATIC_ROUTE_PATHS.has(fullPath)) return result;

    const routeName = pascalCase(fullPath) || pascalCase(menu.name);
    const children = menu.children?.length ? buildRoutes(menu.children, fullPath) : undefined;

    const baseRoute = {
      path: normalizeChildPath(menu.path, String(menu.id)),
      name: routeName,
      meta: {
        title: menu.name,
        titleKey: menu.i18nKey,
        icon: menu.icon,
        keepAlive: menu.isCache === 1,
        hidden: menu.isVisible === 0,
        perm: menu.perms,
      },
    };

    if (menu.type === 1 && children?.length) {
      result.push({
        ...baseRoute,
        redirect: `${fullPath}/${children[0].path}`.replace(/\/+/g, '/'),
        children,
      });
      return result;
    }

    result.push({
      ...baseRoute,
      component: resolveComponent(menu),
      ...(children?.length ? { children } : {}),
    } as RouteRecordRaw);

    return result;
  }, []);
}

function collectRouteNames(routes: RouteRecordRaw[]) {
  const names: string[] = [];
  const visit = (items: RouteRecordRaw[]) => {
    items.forEach((route) => {
      if (typeof route.name === 'string' && !STATIC_ROUTE_NAMES.has(route.name)) {
        names.push(route.name);
      }
      if (route.children?.length) visit(route.children);
    });
  };
  visit(routes);
  return names;
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const menus = ref<MenuItem[]>([]);
  const dynamicRouteNames = ref<string[]>([]);
  const routesLoaded = ref(false);

  function removeDynamicRoutes(router: Router) {
    dynamicRouteNames.value.forEach((name) => {
      if (router.hasRoute(name)) {
        router.removeRoute(name);
      }
    });
    dynamicRouteNames.value = [];
    routesLoaded.value = false;
  }

  async function generateRoutes(menuItems: MenuItem[], router?: Router) {
    menus.value = menuItems;
    routes.value = buildRoutes(menuItems);

    if (router) {
      removeDynamicRoutes(router);
      routes.value.forEach((route) => {
        router.addRoute(ROOT_ROUTE_NAME, route);
      });
      dynamicRouteNames.value = collectRouteNames(routes.value);
      routesLoaded.value = true;
    }

    return routes.value;
  }

  function reset(router?: Router) {
    if (router) {
      removeDynamicRoutes(router);
    } else {
      dynamicRouteNames.value = [];
      routesLoaded.value = false;
    }
    routes.value = [];
    menus.value = [];
  }

  return {
    routes,
    menus,
    dynamicRouteNames,
    routesLoaded,
    generateRoutes,
    reset,
  };
});
