import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import type { Router } from 'vue-router';

import type { MenuItem } from '@/types/menu';

import { usePermissionStore } from './permission';

function createRouterMock() {
  const registered = new Set<string>();
  const registerRoute = (route: { name?: unknown; children?: Array<{ name?: unknown; children?: never[] }> }) => {
    if (typeof route.name === 'string') {
      registered.add(route.name);
    }
    route.children?.forEach(registerRoute);
  };
  return {
    addRoute: vi.fn((_parentName: string, route) => {
      registerRoute(route);
    }),
    hasRoute: vi.fn((name: string) => registered.has(name)),
    removeRoute: vi.fn((name: string) => registered.delete(name)),
  } as unknown as Router;
}

describe('usePermissionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('generates dynamic routes from backend menu tree', async () => {
    const store = usePermissionStore();
    const menus: MenuItem[] = [
      { id: '1', parentId: null, name: 'Dashboard', type: 2, path: '/dashboard' },
      {
        id: '2',
        parentId: null,
        name: '系统管理',
        type: 1,
        path: '/system',
        component: 'Layout',
        children: [
          {
            id: '21',
            parentId: '2',
            name: '用户管理',
            type: 2,
            path: 'user',
            component: 'system/user/index',
            perms: 'system:user:list',
          },
          { id: '22', parentId: '2', name: '新增用户', type: 3, perms: 'system:user:add' },
        ],
      },
    ];

    const routes = await store.generateRoutes(menus);

    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('system');
    expect(routes[0].children).toHaveLength(1);
    expect(routes[0].children?.[0]).toMatchObject({
      path: 'user',
      name: 'SystemUser',
      meta: { perm: 'system:user:list' },
    });
  });

  it('adds and removes generated routes on the active router', async () => {
    const store = usePermissionStore();
    const router = createRouterMock();

    await store.generateRoutes(
      [
        {
          id: '3',
          parentId: null,
          name: '系统监控',
          type: 1,
          path: '/monitor',
          component: 'Layout',
          children: [
            {
              id: '34',
              parentId: '3',
              name: '服务监控',
              type: 2,
              path: 'server',
              component: 'monitor/server/index',
              perms: 'monitor:server:view',
            },
          ],
        },
      ],
      router,
    );

    expect(router.addRoute).toHaveBeenCalledWith('RootLayout', expect.objectContaining({ name: 'Monitor' }));
    expect(store.routesLoaded).toBe(true);
    expect(store.dynamicRouteNames).toEqual(['Monitor', 'MonitorServer']);

    store.reset(router);

    expect(router.removeRoute).toHaveBeenCalledWith('Monitor');
    expect(router.removeRoute).toHaveBeenCalledWith('MonitorServer');
    expect(store.routesLoaded).toBe(false);
  });
});
