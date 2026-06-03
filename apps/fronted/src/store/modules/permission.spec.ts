import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePermissionStore } from './permission';
import type { MenuItem } from '@/types/menu';

describe('usePermissionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('generates routes from non-button menus', async () => {
    const store = usePermissionStore();
    const menus: MenuItem[] = [
      { id: '1', parentId: null, name: 'Dashboard', type: 2, path: 'dashboard' },
      { id: '2', parentId: '1', name: 'Add', type: 3, path: 'add' },
    ];

    const routes = await store.generateRoutes(menus);

    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/dashboard');
  });
});
