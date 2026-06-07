import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import { setupRouterGuard } from './permission';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: 'Login', titleKey: 'login.submit' },
  },
  {
    path: '/',
    name: 'RootLayout',
    component: () => import('../components/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: 'Dashboard', titleKey: 'nav.dashboard', icon: 'Odometer' },
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/profile/index.vue'),
        meta: { title: 'Profile', titleKey: 'common.profile', icon: 'User' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupRouterGuard(router);

export default router;
