import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: 'Login' },
  },
  {
    path: '/',
    component: () => import('../components/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: 'Dashboard', icon: 'Odometer' },
      },
      // System management
      {
        path: '/system/user',
        name: 'UserManagement',
        component: () => import('../views/system/user/index.vue'),
        meta: { title: 'User Management', icon: 'User', perm: 'system:user:list' },
      },
      {
        path: '/system/role',
        name: 'RoleManagement',
        component: () => import('../views/system/role/index.vue'),
        meta: { title: 'Role Management', icon: 'Key', perm: 'system:role:list' },
      },
      {
        path: '/system/dept',
        name: 'DeptManagement',
        component: () => import('../views/system/dept/index.vue'),
        meta: { title: 'Department', icon: 'OfficeBuilding', perm: 'system:dept:list' },
      },
      {
        path: '/system/post',
        name: 'PostManagement',
        component: () => import('../views/system/post/index.vue'),
        meta: { title: 'Post Management', icon: 'Briefcase', perm: 'system:post:list' },
      },
      {
        path: '/system/menu',
        name: 'MenuManagement',
        component: () => import('../views/system/menu/index.vue'),
        meta: { title: 'Menu Management', icon: 'Menu', perm: 'system:menu:list' },
      },
      {
        path: '/system/dict',
        name: 'DictManagement',
        component: () => import('../views/system/dict/index.vue'),
        meta: { title: 'Dictionary', icon: 'Document', perm: 'system:dict:list' },
      },
      {
        path: '/system/config',
        name: 'ConfigManagement',
        component: () => import('../views/system/config/index.vue'),
        meta: { title: 'Config', icon: 'Setting', perm: 'system:config:list' },
      },
      {
        path: '/system/notice',
        name: 'NoticeManagement',
        component: () => import('../views/system/notice/index.vue'),
        meta: { title: 'Notice', icon: 'Bell', perm: 'system:notice:list' },
      },
      // Monitor
      {
        path: '/monitor/login-log',
        name: 'LoginLog',
        component: () => import('../views/monitor/login-log/index.vue'),
        meta: { title: 'Login Log', icon: 'Reading', perm: 'monitor:login-log:list' },
      },
      {
        path: '/monitor/oper-log',
        name: 'OperLog',
        component: () => import('../views/monitor/oper-log/index.vue'),
        meta: { title: 'Operation Log', icon: 'List', perm: 'monitor:oper-log:list' },
      },
      {
        path: '/monitor/online',
        name: 'OnlineUsers',
        component: () => import('../views/monitor/online/index.vue'),
        meta: { title: 'Online Users', icon: 'Connection', perm: 'monitor:online:list' },
      },
      {
        path: '/monitor/server',
        name: 'ServerMonitor',
        component: () => import('../views/monitor/server/index.vue'),
        meta: { title: 'Server Monitor', icon: 'Monitor', perm: 'monitor:server:info' },
      },
      {
        path: '/monitor/cache',
        name: 'CacheMonitor',
        component: () => import('../views/monitor/cache/index.vue'),
        meta: { title: 'Cache Monitor', icon: 'Cpu', perm: 'monitor:cache:info' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/');
  } else {
    next();
  }
});

export default router;