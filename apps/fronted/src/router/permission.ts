import type { Router } from 'vue-router';

import { usePermissionStore } from '@/store/modules/permission';
import { useUserStore } from '@/store/modules/user';

const WHITE_LIST = new Set(['/login']);

function hasPermission(requiredPerm: unknown, permissions: string[]) {
  if (typeof requiredPerm !== 'string' || !requiredPerm) return true;
  return permissions.includes('*:*:*') || permissions.includes(requiredPerm);
}

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to) => {
    const userStore = useUserStore();
    const permissionStore = usePermissionStore();
    const token = userStore.token || localStorage.getItem('token');

    if (!token) {
      if (WHITE_LIST.has(to.path)) return true;
      return { path: '/login', query: { redirect: to.fullPath } };
    }

    if (to.path === '/login') {
      return { path: '/' };
    }

    if (!permissionStore.routesLoaded) {
      try {
        await userStore.getUserInfo(router);
        return { ...to, replace: true };
      } catch {
        userStore.reset(router);
        return { path: '/login', query: { redirect: to.fullPath } };
      }
    }

    if (!hasPermission(to.meta?.perm, userStore.permissions)) {
      return { path: '/dashboard' };
    }

    return true;
  });
}
