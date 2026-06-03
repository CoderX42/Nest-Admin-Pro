# 04 · Web 后台任务卡(Vue 3 + Element Plus)

> 本文档枚举 `apps/fronted` 全部任务卡。规约同 03。
>
> commit message:`[T-XXX] <type>(fronted): <subject>`
>
> ⚠️ 目录名 `apps/fronted` 是历史拼写错误,**保持不动**(详见 00 文档)。

---

## S0 修血洞(让 Web 端能装、能起、能登录)

### T-050 重写 package.json 修复造假版本号

- **类型**: chore
- **上下文**: 当前 `vue-router ^5.0.6` / `vite ^8.0.12` / `typescript ~6.0.2` / `vue-tsc ^3.2.8` / `@vue/tsconfig ^0.9.1` 在 npm 上**都不存在**,`npm install` 必失败
- **涉及文件**:
  - `apps/fronted/package.json`
  - `pnpm-lock.yaml`
- **实施要点**:
  - 完整覆盖式重写,以 `01-conventions.md` § 15.2 的依赖基线为准
  - package name 改为 `fronted`,确保根目录 `pnpm --filter fronted <script>` 可匹配
  - **删除** daisyUI(主题系统不再依赖,见 07 文档)
  - **新增** echarts / vue-echarts / @vueuse/core / nprogress / dayjs / lodash-es / qs / file-saver / exceljs / vuedraggable / unplugin-auto-import / unplugin-vue-components / vite-plugin-svg-icons
  - scripts:
    ```json
    {
      "dev": "vite",
      "build": "vue-tsc -b && vite build",
      "preview": "vite preview",
      "lint": "eslint \"src/**/*.{ts,vue}\" --max-warnings 0",
      "lint:fix": "eslint \"src/**/*.{ts,vue}\" --fix",
      "typecheck": "vue-tsc --noEmit",
      "test": "vitest run",
      "test:watch": "vitest"
    }
    ```
- **验收**:
  - [ ] `pnpm --filter fronted install` 0 报错
  - [ ] `pnpm --filter fronted typecheck` 通过(可保留必要的 `// @ts-expect-error`,后续清理)
  - [ ] grep package.json 无 `vue-router 5` / `vite 8` / `typescript 6` / `daisyui` / `@tailwindcss/vite`

### T-051 vite.config.ts 重写

- **类型**: feat
- **涉及文件**: `apps/fronted/vite.config.ts`
- **实施要点**:
  ```ts
  import { defineConfig, loadEnv } from 'vite';
  import vue from '@vitejs/plugin-vue';
  import AutoImport from 'unplugin-auto-import/vite';
  import Components from 'unplugin-vue-components/vite';
  import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
  import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
  import path from 'node:path';

  export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      base: env.VITE_PUBLIC_PATH || '/',
      resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
      plugins: [
        vue(),
        AutoImport({
          imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
          resolvers: [ElementPlusResolver()],
          dts: 'src/auto-imports.d.ts',
          eslintrc: { enabled: true, filepath: './.eslintrc-auto-import.json' },
        }),
        Components({
          resolvers: [ElementPlusResolver()],
          dts: 'src/components.d.ts',
          dirs: ['src/components'],
        }),
        createSvgIconsPlugin({
          iconDirs: [path.resolve(__dirname, 'src/assets/icons')],
          symbolId: 'icon-[name]',
        }),
      ],
      server: {
        port: 5173,
        proxy: {
          '/api':  { target: 'http://localhost:3000', changeOrigin: true },
          '/file': { target: 'http://localhost:3000', changeOrigin: true },
        },
      },
      build: {
        target: 'es2020',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              'element-plus': ['element-plus'],
              'echarts': ['echarts', 'vue-echarts'],
              'vendor': ['vue', 'vue-router', 'pinia', 'axios', 'dayjs', 'lodash-es'],
            },
          },
        },
      },
      css: { preprocessorOptions: { scss: { additionalData: '@use "@/styles/variables.scss" as *;' } } },
    };
  });
  ```
- **验收**:
  - [ ] dev 启动无 plugin 报错
  - [ ] `pnpm --filter fronted dev` 启动 5173 不白屏
  - [ ] build 产物分包合理(echarts 单独 chunk)
  - [ ] 自动导入 vue/pinia 等工作,无需手写 import

### T-052 删除 HelloWorld.vue 死代码

- **类型**: chore
- **涉及文件**:
  - 删除 `apps/fronted/src/components/HelloWorld.vue`
  - 准备(不创建)`apps/fronted/src/types/` 目录,具体类型文件由 T-053 负责
- **验收**: grep `HelloWorld` 在 src 命中 0

### T-053 新建 types 目录与基础类型

- **类型**: feat
- **涉及文件**:
  - `apps/fronted/src/types/api.ts`(新建,导出共享类型)
  - `apps/fronted/src/types/auth.ts`、`menu.ts`、`user.ts`、`role.ts` 等
  - `packages/shared-types/`(S1 引入,本卡先用 fronted 内部 types,S1 任务卡迁移)
- **实施要点**:
  ```ts
  // types/api.ts
  // 所有 BigInt 主键在前端均用 string 类型,避免 Number 在 > 2^53 时丢精度
  // 后端通过 stringifyBigInt 工具(03 文档 T-002)在响应序列化时统一转字符串
  export type Id = string;

  export interface ApiResponse<T = unknown> {
    code: number;
    data: T;
    message: string;
    timestamp?: number;
    errors?: string[];
  }
  export interface PageQuery {
    pageNum?: number;
    pageSize?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }
  export interface PageResult<T> {
    list: T[];
    total: number;
    pageNum: number;
    pageSize: number;
  }
  ```
  - **强制约定**:`api/**/*.ts` 中所有函数签名,`id` 类型必须是 `Id`(等价 string);切勿使用 `number`,即使后端 BigInt 实际值远小于 2^53。
  - 业务实体定义示例(后续按需扩展):
    ```ts
    // types/system/user.ts
    import type { Id } from '../api';
    export interface SysUser {
      id: Id;
      tenantId: Id | null;
      username: string;
      nickname: string;
      // ...
    }
    ```
- **验收**: 编译通过,在 request.ts 中引用

### T-054 重写 request.ts(类型化、错误码统一处理)

- **类型**: refactor
- **涉及文件**: `apps/fronted/src/utils/request.ts`
- **实施要点**:
  ```ts
  import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { useUserStore } from '@/store/modules/user';
  import type { ApiResponse } from '@/types/api';

  const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    timeout: 30_000,
  });

  service.interceptors.request.use((config) => {
    const userStore = useUserStore();
    if (userStore.token) config.headers.Authorization = `Bearer ${userStore.token}`;
    return config;
  });

  let isRefreshing401 = false;
  service.interceptors.response.use(
    (resp: AxiosResponse<ApiResponse>) => {
      // 文件流(从 responseType 判定),直接返回原始响应
      if (resp.config.responseType === 'blob') return resp;
      const { code, message, data } = resp.data;
      if (code === 200) return data;
      // 业务码(1xxx 等),弹 toast,返回 reject 由调用方决定
      // 注意:HTTP 401 永远走 error 分支,不会进入这里
      ElMessage.error(message ?? '请求失败');
      return Promise.reject(resp);
    },
    async (err) => {
      const status = err.response?.status;
      if (status === 401) {
        if (isRefreshing401) return Promise.reject(err);
        isRefreshing401 = true;
        try {
          const userStore = useUserStore();
          await userStore.logout({ silent: true });
          await ElMessageBox.alert('登录已过期,请重新登录', '提示', { type: 'warning' });
          location.href = '/login';
        } finally { isRefreshing401 = false; }
      } else if (status === 403) {
        ElMessage.error('权限不足');
      } else if (status === 429) {
        ElMessage.error('请求过于频繁,稍后再试');
      } else if (status >= 500) {
        ElMessage.error('服务器异常,请稍后再试');
      } else {
        ElMessage.error(err.response?.data?.message ?? err.message ?? '请求失败');
      }
      return Promise.reject(err);
    },
  );

  export function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return service.request<unknown, T>(config);
  }
  export default service;
  ```
- **验收**:
  - [ ] 401 统一跳登录,不重复弹窗
  - [ ] 业务码错误弹 toast 不跳登录
  - [ ] blob 响应不被解析

### T-055 拆分 api/ 目录为模块化文件

- **类型**: refactor
- **上下文**: 当前 `src/api/index.ts` 单文件 155 行混合所有模块
- **涉及文件**: 拆分为
  ```text
  apps/fronted/src/api/
  ├── auth.ts
  ├── system/
  │   ├── user.ts
  │   ├── role.ts
  │   ├── dept.ts
  │   ├── post.ts
  │   ├── menu.ts
  │   ├── dict.ts
  │   ├── config.ts
  │   ├── notice.ts
  │   ├── tenant.ts
  │   └── file.ts
  ├── monitor/
  │   ├── login-log.ts
  │   ├── oper-log.ts
  │   ├── online.ts
  │   ├── server.ts
  │   ├── cache.ts
  │   └── job.ts
  ├── tool/
  │   └── gen.ts
  └── profile.ts
  ```
- **实施要点**:
  - 每个文件:`import { request } from '@/utils/request'`,导出强类型函数
  - 示例:
    ```ts
    // api/system/user.ts
    import { request } from '@/utils/request';
    import type { PageQuery, PageResult } from '@/types/api';
    import type { SysUser, UserQuery, CreateUserDto, UpdateUserDto } from '@/types/system/user';

    export const userApi = {
      page: (q: UserQuery & PageQuery) => request<PageResult<SysUser>>({ url: '/system/user', method: 'get', params: q }),
      get:  (id: number | string) => request<SysUser>({ url: `/system/user/${id}`, method: 'get' }),
      create: (body: CreateUserDto) => request<void>({ url: '/system/user', method: 'post', data: body }),
      update: (id: number | string, body: UpdateUserDto) => request<void>({ url: `/system/user/${id}`, method: 'put', data: body }),
      remove: (ids: (number | string)[]) => request<void>({ url: '/system/user', method: 'delete', data: { ids } }),
      resetPwd: (id: number | string) => request<void>({ url: `/system/user/${id}/password/reset`, method: 'put' }),
      assignRoles: (id: number | string, roleIds: (number | string)[]) => request<void>({ url: `/system/user/${id}/roles`, method: 'put', data: { roleIds } }),
      changeStatus: (id: number | string, status: 0 | 1) => request<void>({ url: `/system/user/${id}/status`, method: 'put', data: { status } }),
      template: () => request<Blob>({ url: '/system/user/template', method: 'get', responseType: 'blob' }),
      export:   (q: UserQuery) => request<Blob>({ url: '/system/user/export', method: 'get', params: q, responseType: 'blob' }),
      import:   (file: File) => { const fd = new FormData(); fd.append('file', file); return request<{ success: number; fail: number; errors: string[] }>({ url: '/system/user/import', method: 'post', data: fd }); },
    };
    ```
- **验收**:
  - [ ] 所有页面对接新 api 文件,旧 `api/index.ts` 删除
  - [ ] grep 旧 `import { ... } from '@/api'` 命中 0(改为 `'@/api/system/user'` 等)

### T-056 重构 user store + 新增 app store + permission store + dict store

- **类型**: refactor
- **涉及文件**:
  - `apps/fronted/src/store/modules/user.ts`(重写)
  - `apps/fronted/src/store/modules/app.ts`(新建,sidebar collapsed / device / locale)
  - `apps/fronted/src/store/modules/permission.ts`(新建,动态路由生成)
  - `apps/fronted/src/store/modules/tags-view.ts`(新建,多标签页)
  - `apps/fronted/src/store/modules/dict.ts`(新建,字典缓存)
- **实施要点**:
  ```ts
  // store/modules/user.ts
  export const useUserStore = defineStore('user', () => {
    const token = useStorage<string>('nap_token', '');
    const userInfo = ref<UserInfo | null>(null);
    const roles = ref<string[]>([]);
    const permissions = ref<string[]>([]);
    const menus = ref<MenuItem[]>([]);

    async function login(form: LoginForm) {
      const data = await authApi.login(form);
      token.value = data.token;
      await fetchInfo();
    }
    async function fetchInfo() {
      const data = await authApi.getUserInfo();
      userInfo.value = data.user;
      roles.value = data.roles;
      permissions.value = data.permissions;
      menus.value = data.menus;
      const permissionStore = usePermissionStore();
      await permissionStore.generateRoutes(menus.value);
    }
    async function logout(opts: { silent?: boolean } = {}) {
      try { if (!opts.silent) await authApi.logout(); } catch {}
      token.value = '';
      userInfo.value = null;
      roles.value = [];
      permissions.value = [];
      menus.value = [];
      usePermissionStore().reset();
      useTagsViewStore().reset();
    }
    return { token, userInfo, roles, permissions, menus, login, fetchInfo, logout };
  });
  ```
- **验收**: 5 个 store 编译通过,各自单测覆盖核心 action

### T-057 修复登录页(图形验证码 + 表单校验 + i18n 全覆盖)

- **类型**: feat
- **涉及文件**: `apps/fronted/src/views/login/index.vue`
- **实施要点**:
  - 调用 `authApi.captcha()` 获取 svg + uuid → 显示
  - rememberMe 用 useStorage 存 username
  - 提交流程:`userStore.login(form)` → `router.push(redirect ?? '/')`
  - 失败:1003 用户名或密码错误,1001 验证码错误,1002 验证码过期 → 自动刷新验证码
  - 所有文案走 i18n
- **验收**:
  - [ ] 默认 admin/admin123 登录成功跳仪表盘
  - [ ] 验证码错误自动刷新
  - [ ] 中英文切换文案正确

---

## S1 基础设施(前端相关)

### T-150 引入 NProgress + 全局 loading 指令

- **类型**: feat
- **涉及文件**:
  - `apps/fronted/src/router/index.ts`(beforeEach/afterEach 接 NProgress)
  - `apps/fronted/src/utils/request.ts`(请求计数,>0 显示)
- **验收**: 路由切换与 axios 请求都有进度条

### T-151 svg-icons 与图标系统

- **类型**: feat
- **涉及文件**:
  - `apps/fronted/src/assets/icons/`(放置 svg)
  - `apps/fronted/src/components/SvgIcon/index.vue`
- **实施要点**:
  ```vue
  <template>
    <svg :class="['svg-icon', `svg-icon-${name}`]" aria-hidden="true">
      <use :href="`#icon-${name}`" />
    </svg>
  </template>
  <script setup lang="ts">
  defineProps<{ name: string }>();
  </script>
  ```
  - 准备 ~30 个项目用 icon(可从 @element-plus/icons-vue 补充,菜单 icon 用 Element 自带为主)
- **验收**: `<svg-icon name="dashboard" />` 渲染正常

### T-152 国际化目录拆分

- **类型**: refactor
- **涉及文件**: `apps/fronted/src/i18n/`
- **实施要点**:
  ```text
  i18n/
  ├── index.ts                # createI18n
  ├── zh-CN/
  │   ├── index.ts            # merge 所有模块
  │   ├── common.ts
  │   ├── auth.ts
  │   ├── menu.ts
  │   ├── system.user.ts
  │   ├── system.role.ts
  │   ├── ...(每个页面一个文件)
  └── en-US/
      └── ...(同上)
  ```
  - 删除单文件 702 行 i18n 巨型文件
  - 全代码硬编码中文清查 + 替换 t() 调用
- **验收**:
  - [ ] grep 中文字符在 .vue / .ts 中命中 0(注释除外)
  - [ ] 切换 en-US 后所有页面、按钮、表头、占位符英文显示

---

## S2 数据模型(前端只在 S3 第一卡前对接,无独立阶段卡)

S2 期间后端会改字段名(`createTime → createdAt` 等)、补 `tenantId` 字段。前端的适配工作集中在 **S3 起始**(进入 RBAC 实施前)一次性处理:

- 各 api/*.ts 的实体类型字段全量更新
- 各页面表格列、表单字段引用同步
- types/system/*.ts 与后端 schema 一致

把这部分作为 S3 准备工作,**不单独列阶段**;Codex 在 S3 第一卡(T-350)前完成。

---

## S3 RBAC + 多租户 + 动态路由 + v-perm

### T-350 实现 v-perm 指令 + usePerm 组合式

- **类型**: feat
- **涉及文件**:
  - `apps/fronted/src/directives/perm.ts`
  - `apps/fronted/src/composables/usePerm.ts`
  - `apps/fronted/src/main.ts`(注册)
- **实施要点**:
  ```ts
  // directives/perm.ts
  import type { Directive } from 'vue';
  import { useUserStore } from '@/store/modules/user';

  function check(value: unknown, all: boolean, role: boolean): boolean {
    const store = useUserStore();
    const list = store[role ? 'roles' : 'permissions'];
    if (!role && list.includes('*:*:*')) return true;
    const need = ([] as string[]).concat(value as string | string[]);
    return all ? need.every(p => list.includes(p)) : need.some(p => list.includes(p));
  }

  export const permDirective: Directive = {
    mounted(el, binding) {
      const all = binding.modifiers.all === true;
      const role = binding.modifiers.role === true;
      if (!check(binding.value, all, role)) {
        el.parentNode?.removeChild(el);
      }
    },
  };
  ```
  - usePerm:
    ```ts
    export function usePerm() {
      const store = useUserStore();
      function hasPerm(p: string | string[], all = false): boolean { ... }
      function hasRole(r: string | string[]): boolean { ... }
      return { hasPerm, hasRole };
    }
    ```
- **验收**:
  - [ ] 组件挂载后无 perm 节点被移除
  - [ ] platform_admin 看到所有按钮
  - [ ] 单测覆盖 single / array / .all / .role 4 种用法

### T-351 动态路由生成

- **类型**: feat
- **涉及文件**:
  - `apps/fronted/src/store/modules/permission.ts`
  - `apps/fronted/src/router/dynamic.ts`(新建)
  - `apps/fronted/src/views/error/404.vue`(新建)
- **实施要点**:
  ```ts
  // permission.ts
  const modules = import.meta.glob('@/views/**/*.vue');
  function loadComponent(component: string) {
    if (component === 'Layout') return Layout;
    const path = `/src/views/${component}.vue`;
    return modules[path] ?? (() => import('@/views/error/404.vue'));
  }
  function buildRoutes(menus: MenuItem[]): RouteRecordRaw[] {
    return menus.filter(m => m.type !== 3).map((m) => ({
      path: m.parentId === 0 ? `/${m.path}` : m.path,
      name: pascalCase(m.path),
      component: loadComponent(m.component ?? 'Layout'),
      meta: {
        title: m.name,
        i18nKey: m.i18nKey,
        icon: m.icon,
        keepAlive: m.isCache === 1,
        hidden: m.isVisible === 0,
        perms: m.perms,
      },
      children: m.children?.length ? buildRoutes(m.children) : undefined,
    }));
  }
  async function generateRoutes(menus: MenuItem[]) {
    const dynamic = buildRoutes(menus);
    dynamic.forEach(r => router.addRoute(r));
    router.addRoute({ path: '/:pathMatch(.*)*', component: () => import('@/views/error/404.vue') });
    permissionStore.routes = dynamic;
  }
  ```
- **验收**:
  - [ ] 登录后菜单从 user/getUserInfo 返回的 menus 渲染
  - [ ] 没有该菜单的 URL 直接访问 → 404
  - [ ] keepAlive 字段生效(配合 T-352)

### T-352 路由守卫(NProgress + 鉴权 + 标题)

- **类型**: feat
- **涉及文件**: `apps/fronted/src/router/index.ts`、`router/permission.ts`
- **实施要点**:
  ```ts
  // router/permission.ts
  const whiteList = ['/login', '/404'];
  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    document.title = `${to.meta.title ? i18n.t(to.meta.i18nKey ?? to.meta.title) + ' - ' : ''}${import.meta.env.VITE_APP_TITLE}`;
    const userStore = useUserStore();
    if (userStore.token) {
      if (to.path === '/login') return next('/');
      if (!userStore.menus.length) {
        try { await userStore.fetchInfo(); return next({ ...to, replace: true }); }
        catch { await userStore.logout({ silent: true }); return next(`/login?redirect=${to.path}`); }
      }
      // perm 校验:meta.perms 存在且当前用户无该 perm → 403
      if (to.meta.perms && !usePerm().hasPerm(to.meta.perms as string)) return next('/403');
      return next();
    }
    if (whiteList.includes(to.path)) return next();
    return next(`/login?redirect=${to.path}`);
  });
  router.afterEach(() => NProgress.done());
  ```
- **验收**:
  - [ ] 直接访问 /system/user 未登录 → 跳 /login?redirect=/system/user
  - [ ] 登录后自动跳回原 redirect
  - [ ] 无权限菜单 url 直接访问 → /403

### T-353 Layout 框架重写(Sidebar / Navbar / TagsView / AppMain / Settings)

- **类型**: refactor
- **涉及文件**: `apps/fronted/src/layout/`(新建,替换原 `components/layout/`)
- **实施要点**:
  ```text
  layout/
  ├── index.vue                  # 整体布局
  ├── components/
  │   ├── Sidebar/
  │   │   ├── index.vue
  │   │   ├── Logo.vue
  │   │   ├── SidebarItem.vue    # 递归渲染菜单
  │   │   └── SidebarMenu.vue
  │   ├── Navbar/
  │   │   ├── index.vue
  │   │   ├── Hamburger.vue
  │   │   ├── Breadcrumb.vue
  │   │   ├── Search.vue          # 全局搜索菜单
  │   │   ├── ScreenfullToggle.vue
  │   │   ├── LangSelect.vue
  │   │   ├── ThemeSelect.vue
  │   │   ├── Notice.vue          # 通知红点(对接 sys_notice)
  │   │   ├── TenantSwitch.vue    # 平台超管切换租户
  │   │   └── UserDropdown.vue
  │   ├── TagsView/
  │   │   ├── index.vue
  │   │   └── ScrollPane.vue
  │   ├── AppMain.vue             # router-view + keep-alive
  │   └── Settings/
  │       └── index.vue           # 主题面板(S10 接入)
  ```
  - Sidebar 用 `el-menu` 默认折叠,响应 `app.sidebar.collapsed` state
  - Navbar 含面包屑、全局搜索(基于 menus 的 fuzzy 搜索,vueuse useFuse)、全屏、语言、主题、通知、租户切换、用户菜单
  - TagsView:多标签页 + 右键关闭/关闭其他/关闭全部/刷新
- **验收**:
  - [ ] 布局响应式(< 768px 抽屉模式)
  - [ ] 菜单递归任意层级正确
  - [ ] 多标签切换 + keepAlive 生效

### T-354 租户切换组件(平台超管专用)

- **类型**: feat
- **实施要点**:
  - `Navbar/TenantSwitch.vue`:仅 `v-perm.role="'platform_admin'"` 显示
  - 下拉显示租户列表,选中调 `authApi.switchTenant(tenantId)` → 重新 fetchInfo + 重置路由 + reload tagsView
  - 当前租户名固化到 navbar
- **验收**: 切换后所有列表数据切到对应租户

---

## S4 系统管理页面(对齐后端)

> 这一阶段每张卡都遵循统一模式,以下统一描述,不为每个模块单独写卡(避免文档膨胀)。Codex 实施时按页面逐一对齐;每个模块在 commit 中带卡号 `T-4XX`。

### T-400 用户管理页面完善

- **涉及文件**: `apps/fronted/src/views/system/user/index.vue`、`components/UserForm.vue`、`components/AssignRoleDialog.vue`、`components/ImportDialog.vue`
- **要点**:
  - 使用公共 Pagination 组件(T-470)
  - 顶部表单:username / phone / status / deptId(树选择) / 创建时间(daterange)
  - 工具栏:新增 / 批量删除 / 导入 / 导出 / 模板 / 列设置(显隐字段)
  - 行操作:编辑 / 重置密码 / 分配角色 / 状态切换 / 删除
  - 所有按钮 v-perm
  - 列:头像 / 用户名 / 昵称 / 部门 / 手机 / 状态(字典标签) / 创建时间
  - 弹窗表单:校验规则 + Excel 导入 + 拖拽上传头像
- **验收**: 全 CRUD + 批量 + 导入导出 + 重置密码 + 分配角色 都能跑通

### T-401 角色管理

- 列表 / CRUD / 分配菜单(树) / 设置数据范围(radio + 自定义部门弹窗)
- dataScope=Custom 时显示部门多选树

### T-402 部门管理

- 树形表格(`row-key="id"` + `default-expand-all`)
- 创建/编辑时 parentId 用 TreeSelect 公共组件

### T-403 岗位管理

- 简单 CRUD + 状态切换

### T-404 菜单管理

- 树形表格 + 拖拽排序(vuedraggable + drag-handle)
- type=3 按钮的 perm 字段必填校验

### T-405 字典管理(双栏)

- 左:字典类型表 + CRUD
- 右:选中类型后显示字典数据 CRUD
- 编辑时 cssClass / listClass 用下拉选(success / warning / danger / info / primary)

### T-406 参数配置

- 列表 / CRUD / 刷新缓存按钮
- isBuiltin=1 的不允许删除,UI 禁用按钮

### T-407 通知公告

- 列表 / CRUD / 发布 / 撤回 / 状态字典标签
- 富文本编辑器(可用 wangeditor 或简化为 textarea + markdown 预览,**默认用 textarea + markdown**,降低依赖体积)
- 已发布通知不可编辑(disabled 提示)

### T-408 文件管理

- 列表 + 上传(支持拖拽 + 多选)+ 预览(图片/PDF inline,其他下载)+ 复制 URL + 批量删除

### T-409 文件存储配置

- 单页面:radio 选驱动,根据驱动显示对应字段(本地无 / 4 家云存储各一组字段)
- 提交后调 refresh 接口,前端无需重启

### T-410 租户管理(平台超管专用)

- 列表 / CRUD / 状态切换 / 套餐管理(预留)
- 顶部加 banner 提示"仅平台超管可见"
- 路由 meta.roles=['platform_admin'],路由守卫 + v-perm.role 双重保护

---

## S5 监控页面

### T-500 服务监控页(含 ECharts)

- **涉及文件**: `apps/fronted/src/views/monitor/server/index.vue`
- **要点**:
  - 接入 ECharts:CPU 折线图(实时刷新 5s)、内存饼图、磁盘条形图
  - 卡片:进程信息、操作系统、Node 版本、运行时长(human-readable)
  - 用 `vue-echarts` 包裹,响应式 resize
- **验收**: 数据真实、刷新流畅、resize 不卡

### T-501 缓存监控

- 信息卡片(memory / clients / commands)+ 命令统计柱状图
- key 列表(支持 pattern 输入),点击 key 显示 value(JSON 树渲染)

### T-502 在线用户

- 分页列表 + 强制下线按钮(二次确认)
- 自动刷新(30s 一次,可配置)

### T-503 登录日志 / 操作日志

- 顶部筛选 + 分页表格 + 详情弹窗(操作日志的 reqParams / respResult JSON 美化显示)
- 工具栏:批量删除 / 清空 / 导出
- 字典标签显示状态、操作类型

---

## 公共组件(贯穿 S0-S4 持续补充)

> 公共组件卡放在 `T-470 ~ T-478` 区段,不与 03 文档的 `T-450 ~ T-454`(后端 message/dashboard 等)撞号。
>
> **实施时机**:
> - **T-470 Pagination 必须在 S3 收尾、S4 起步前完成**(S4 所有页面都依赖)
> - **T-473 DictTag 系列**与 **T-474 TreeSelect** 在 S4 用户/部门/字典页前完成
> - 其余可随用随补,不强制阶段
>
> 把它们视为 "S3 后期 / S4 前置" 即可,不单独列阶段门禁。

### T-470 Pagination 组件

- **涉及文件**: `apps/fronted/src/components/Pagination/index.vue`
- **要点**: 包装 el-pagination,默认 layout='total, sizes, prev, pager, next, jumper',pageSizes=[10,20,50,100]
- **使用**: 所有页面替换重复分页代码

### T-471 RightToolbar(刷新 / 列设置)

- 刷新当前列表
- 列显隐配置(localStorage 持久化)

### T-472 IconSelect

- 弹窗式 icon 选择器,菜单 icon 字段使用

### T-473 DictTag / DictSelect / DictRadio / DictCheckbox

- 全部通过 dictStore.getItems(typeCode) 取数据
- DictTag 根据 cssClass 渲染颜色

### T-474 TreeSelect

- 包装 el-tree-select,部门 / 菜单 父级选择统一用

### T-475 ImageUpload / FileUpload

- 包装 el-upload,默认对接 `/api/file/upload`,自动注入 token,显示上传进度

### T-476 Editor(轻量富文本)

- 默认 textarea + 上传图片 + markdown 预览;若需所见即所得,引入 wangeditor 5(可选,默认不引入)

### T-477 SvgIcon(已在 T-151)

### T-478 全局确认 / 加载工具

- `apps/fronted/src/utils/modal.ts`:`confirm(title, msg) → Promise<boolean>`、`success/error toast`

---

## 路由 / Layout / 默认页面

### T-460 仪表盘重做

- **要点**:
  - 顶部欢迎语 + 当前时间 + 角色卡
  - 4 个统计卡(用户数、租户数、登录次数、文件数)
  - 折线图:近 30 天登录趋势(对接 monitor/login-log/stats)
  - 饼图:用户角色分布
  - 表格:最近 10 条登录日志、最近 10 条操作日志
- 数据源:对接 `/api/dashboard/overview`(后端 03 文档 T-452 提供;本卡前端在 S5 一并实施,S4 期间可临时用 mock)

### T-461 个人中心重做

- 三栏布局:头像 + 基本信息 / 修改资料表单 / 修改密码表单
- 对接 `/api/auth/profile` 等

### T-462 错误页:403 / 404 / 500

- 三个页面共用同一布局,带返回首页按钮

### T-463 工具页:代码生成器

- **涉及文件**: `apps/fronted/src/views/tool/gen/index.vue` 等
- **要点**:
  - Step 1 选表(从 information_schema):多选 + 导入
  - Step 2 表配置(模块名 / 业务名 / 类名 / 上级菜单):表单
  - Step 3 字段配置:可拖拽排序、勾选 isList / isQuery / isInsert / isEdit、选 htmlType / queryType / dictType
  - Step 4 预览:Tab 切换文件,代码高亮(`vue-codemirror` 或 highlight.js,**优先 highlight.js**,体积小)
  - Step 5 下载 / 写库
- 权限要求 platform_admin 才能访问

---

## S7 定时任务页面

> 前端 S7 卡使用 `T-750 / T-751`,避免与 03 文档 T-700/T-701 撞号。

### T-750 任务管理列表

- 列表 / CRUD / 暂停 / 恢复 / 立即执行 / 查看日志
- cron 输入框旁边:`预览下次 5 次触发时间` 按钮,弹窗显示
- 状态字典标签
- 高级:以表格形式显示 status、misfirePolicy、concurrent、prevFireAt、nextFireAt

### T-751 任务日志

- 分页 / 筛选(按 jobId、状态、时间范围)/ 详情弹窗(error stack 折叠展示)

---

## S8 移动端独立(见 05 文档)

## S9 工程化收尾(见 06 文档)

## S10 主题(见 07 文档)

---

## 全部 Web 端任务卡总数

| Stage | 卡数 | 累计 |
| --- | --- | --- |
| S0 | 8  | 8 |
| S1 | 3  | 11 |
| S3 | 5  | 16 |
| S4 | 11 | 27 |
| S5 | 4  | 31 |
| 公共(T-470~T-478) | 9  | 40 |
| 默认页(T-460~T-463) | 4  | 44 |
| S7 前端(T-750~T-751) | 2  | 46 |

---

完。下一份 `05-app.md` 给出移动端任务卡。
