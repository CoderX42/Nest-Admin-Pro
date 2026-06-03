# 05 · 移动端任务卡(UniApp + Vue 3)

> 本文档枚举 `apps/app` 全部任务卡。规约同 03。
>
> commit message:`[T-XXX] <type>(app): <subject>`
>
> 当前状态:**应用启动即崩溃**(pinia 未注册 + import 路径错 + 验证码 API 未定义),业务实现量为 0。S0 必须先把"能跑起来"做到位,S8 才能补业务。

---

## S0 修血洞(让 H5 / 微信小程序能起来,默认账号能登录到首页)

### T-080 重写 package.json,补充缺失依赖

- **类型**: chore
- **上下文**: pinia 在源码中使用但 package.json 未声明,@vueuse/core / dayjs / sass 缺失
- **涉及文件**:
  - `apps/app/package.json`
  - `pnpm-lock.yaml`
- **实施要点**:
  - 完整覆盖式重写,以 `01-conventions.md` § 15.3 为准
  - package name 改为 `app`,确保根目录 `pnpm --filter app <script>` 可匹配
  - DCloud 全家桶版本号必须**严格一致**(从 `npx degit dcloudio/uni-preset-vue#vite-ts` 同步最新稳定版,或 `npx create-uni-app@latest` 拿当前版本)
  - 删除未使用的 `vue-i18n`(P2 真要 i18n 再加)
  - 新增 pinia / @vueuse/core / dayjs / sass(devDep)
  - scripts 保留 dcloudio 默认 dev / build 矩阵,新增:
    ```json
    {
      "dev:h5": "uni",
      "build:h5": "uni build",
      "dev:mp-weixin": "uni -p mp-weixin",
      "build:mp-weixin": "uni build -p mp-weixin",
      "lint": "eslint \"src/**/*.{ts,vue}\" --max-warnings 0",
      "typecheck": "vue-tsc --noEmit"
    }
    ```
- **验收**:
  - [ ] `pnpm --filter app install` 成功
  - [ ] package.json 含 pinia / @vueuse/core / dayjs / sass,且无 vue-i18n
  - [ ] H5/小程序启动验收延后到 T-081/T-085/T-087,避免在 Pinia/别名/路由守卫未修前误判

### T-081 main.ts 接入 Pinia

- **类型**: feat
- **上下文**: 当前 `main.ts:1-9` 没有 `app.use(createPinia())`,任何 `useXxxStore()` 都炸
- **涉及文件**: `apps/app/src/main.ts`
- **实施要点**:
  ```ts
  import { createSSRApp } from 'vue';
  import { createPinia } from 'pinia';
  import App from './App.vue';

  export function createApp() {
    const app = createSSRApp(App);
    app.use(createPinia());
    return { app };
  }
  ```
- **验收**:
  - [ ] `pnpm --filter app dev:h5` 启动后无 `getActivePinia()` 报错,任意 store 调用正常
  - [ ] H5 dev server ready(当前 UniApp 默认绑定 5173;若 5173 被占用再按 Vite 自动端口为准)

### T-082 修复 import 路径错误与登出跳转错误

- **类型**: fix
- **依赖**: T-085(vite 别名)— 实施顺序上**必须先做 T-085 再做 T-082**,虽然 ID 排序未反映依赖
- **涉及文件**:
  - `apps/app/src/pages/index/index.vue:34` `from '../stores/user'` → `'@/stores/user'`(借助 vite 别名,T-085 配置)
  - `apps/app/src/pages/center/index.vue:76` `uni.switchTab` → `uni.reLaunch({ url: '/pages/login/index' })`
  - 全代码 grep `from '../stores'` 与 `from '../api'` 等错误相对路径,统一改 `@/` 别名
- **验收**:
  - [ ] H5 启动 → 首页显示用户信息(不抛 import 错)
  - [ ] 登出 → 跳到登录页(reLaunch 清栈)

### T-083 删除登录页对未实现 captcha 的调用

- **类型**: fix
- **上下文**: `pages/login/index.vue:45` 调用 `authApi.captcha()`,API 层未定义,首屏抛 TypeError
- **涉及文件**:
  - `apps/app/src/pages/login/index.vue`
  - `apps/app/src/api/auth.ts`
  - `apps/app/src/api/index.ts`(re-export authApi,兼容旧调用)
  - `apps/app/src/stores/user.ts`(动态导入改用新 authApi)
- **实施要点**:
  - **决策**:移动端登录暂不强制图形验证码(移动端用户体验差异)
  - 默认 `sys.captcha.enabled=true` 时 H5 启用,小程序禁用(条件编译)
  - api/auth.ts 补上完整 `captcha()` / `validateCaptcha()` 定义,与 backend 对接
  - 登录页:H5 显示 svg 验证码;非 H5 端不显示该字段
  ```ts
  // #ifdef H5
  const showCaptcha = ref(true);
  // #endif
  // #ifndef H5
  const showCaptcha = ref(false);
  // #endif
  ```
- **验收**:
  - [ ] 静态检查:`authApi.captcha()` / `authApi.validateCaptcha()` 已定义
  - [ ] H5 登录页包含验证码字段与 captchaKey/captchaText 提交
  - [ ] 微信小程序登录页通过 `showCaptcha=false` 不显示验证码,直接账号密码
  - [ ] H5 build 留到 T-082/T-085 修完 import/alias 后统一验证

### T-084 baseURL 抽到 env + 平台条件编译

- **类型**: refactor
- **涉及文件**:
  - `apps/app/src/utils/env.ts`(新建)
  - `apps/app/.env.development` / `.env.production`(新建)
  - `apps/app/src/utils/request.ts`
  - `apps/app/src/api/auth.ts`(删除重复的 BASE_URL 定义)
- **实施要点**:
  ```ts
  // utils/env.ts
  // #ifdef H5
  export const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';
  export const FILE_BASE_URL = (import.meta.env.VITE_FILE_BASE_URL as string) || '/file';
  // #endif

  // #ifndef H5
  // 小程序硬编码生产域名(开发期可临时改 localhost,但要在 manifest 里关闭 urlCheck)
  export const BASE_URL = 'https://api.example.com/api';
  export const FILE_BASE_URL = 'https://api.example.com/file';
  // #endif

  export const APP_VERSION = '1.0.0';
  ```
  - manifest.json 的 H5 模块加 devServer.proxy 把 /api → http://localhost:3000
- **验收**:
  - [ ] H5 dev 模式走 vite 代理到 backend,无跨域错
  - [ ] 切换 production 构建能用环境变量替换 BASE_URL

### T-085 vite 别名 + tsconfig paths

- **类型**: feat
- **涉及文件**:
  - `apps/app/vite.config.ts`
  - `apps/app/tsconfig.json`
  - `apps/app/src/utils/env.ts`(修正条件编译重复声明,保证 vue-tsc 可读)
- **实施要点**:
  ```ts
  // vite.config.ts
  import { defineConfig } from 'vite';
  import uni from '@dcloudio/vite-plugin-uni';
  import path from 'node:path';
  export default defineConfig({
    plugins: [uni()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  });
  ```
  ```json
  // tsconfig.json
  { "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"] } } }
  ```
- **验收**:
  - [ ] vite.config.ts 与 tsconfig.json 均配置 `@ -> src`
  - [ ] 全代码 `from '@/...'` 编译通过(完整 typecheck 待 T-082 修掉旧相对路径后复验)

### T-086 request.ts 重写

- **类型**: refactor
- **涉及文件**: `apps/app/src/utils/request.ts`
- **实施要点**:
  ```ts
  import { BASE_URL } from './env';

  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
  interface RequestOptions {
    url: string;
    method?: Method;
    data?: unknown;
    params?: Record<string, unknown>;
    header?: Record<string, string>;
    silent?: boolean;             // 是否屏蔽错误 toast
    noAuth?: boolean;             // 是否跳过 token 注入
  }

  let isHandling401 = false;

  export function request<T = unknown>(opts: RequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('nap_token');
      const header: Record<string, string> = { 'Content-Type': 'application/json', ...opts.header };
      if (token && !opts.noAuth) header.Authorization = `Bearer ${token}`;

      const url = opts.url.startsWith('http') ? opts.url : BASE_URL + opts.url;
      const finalUrl = opts.params ? `${url}?${stringifyQuery(opts.params)}` : url;

      uni.request({
        url: finalUrl,
        method: opts.method ?? 'GET',
        data: opts.data,
        header,
        timeout: 30_000,
        success: (resp) => {
          const status = resp.statusCode;
          const body = resp.data as ApiResponse<T>;
          if (status === 401) {
            handle401(opts.silent);
            return reject(new Error('Unauthorized'));
          }
          if (status >= 400) {
            if (!opts.silent) uni.showToast({ title: body?.message || `网络异常 ${status}`, icon: 'none' });
            return reject(new Error(body?.message || `HTTP ${status}`));
          }
          if (body.code === 200) return resolve(body.data);
          if (!opts.silent) uni.showToast({ title: body.message ?? '请求失败', icon: 'none' });
          reject(new Error(body.message));
        },
        fail: (err) => {
          if (!opts.silent) uni.showToast({ title: '网络连接失败', icon: 'none' });
          reject(err);
        },
      });
    });
  }

  function handle401(silent?: boolean) {
    if (isHandling401) return;
    isHandling401 = true;
    uni.removeStorageSync('nap_token');
    if (!silent) uni.showToast({ title: '登录已过期', icon: 'none' });
    setTimeout(() => {
      isHandling401 = false;
      uni.reLaunch({ url: '/pages/login/index' });
    }, 800);
  }

  function stringifyQuery(p: Record<string, unknown>): string {
    return Object.entries(p)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
  }
  ```
  - 同步实现 `upload(filePath, formData)` 走同样的鉴权与 401 处理
- **验收**:
  - [ ] 登录后请求自动带 token
  - [ ] 401 不重复跳登录
  - [ ] 网络失败、业务错误、HTTP 错误三种场景正确分流

### T-087 全局路由守卫(onLaunch + 拦截 navigateTo)

- **类型**: feat
- **涉及文件**:
  - `apps/app/src/App.vue` onLaunch
  - `apps/app/src/utils/router-guard.ts`(新建)
- **实施要点**:
  ```ts
  // utils/router-guard.ts
  const WHITE_LIST = ['/pages/login/index', '/pages/agreement/privacy', '/pages/agreement/terms'];

  function intercept(method: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch') {
    uni.addInterceptor(method, {
      invoke(args) {
        const path = (args.url ?? '').split('?')[0];
        if (WHITE_LIST.includes(path)) return args;
        const token = uni.getStorageSync('nap_token');
        if (!token) {
          uni.reLaunch({ url: '/pages/login/index' });
          return false;
        }
        return args;
      },
    });
  }
  export function setupRouterGuard() {
    (['navigateTo', 'redirectTo', 'switchTab', 'reLaunch'] as const).forEach(intercept);
  }
  ```
  App.vue onLaunch 调用 `setupRouterGuard()`,并校验 token 决定首屏路径
- **验收**:
  - [ ] 未登录直接打开首页 → 跳登录
  - [ ] 已登录打开登录页 → 跳首页

---

## S1 基础设施(移动端相关)

### T-180 stores 完善:user / app / dict / message

- **类型**: feat
- **涉及文件**: `apps/app/src/stores/{user,app,dict,message}.ts`
- **要点**:
  - `user`:token / userInfo / roles / permissions / login / logout / fetchInfo
  - `app`:theme / fontSize / network / appVersion(setup 函数)
  - `dict`:与 backend `/api/system/dict/data/byType/:code` 对接,缓存到内存 + uni.setStorageSync
  - `message`:未读消息数(角标)、消息列表 — 用于工作台红点
- **验收**: 各 store 独立 + 持久化字段持久,无 SSR 报错

### T-181 hasPerm / hasRole 工具函数

- **类型**: feat
- **涉及文件**: `apps/app/src/utils/permission.ts`
- **要点**:
  ```ts
  export function hasPerm(p: string | string[], all = false): boolean { ... }
  export function hasRole(r: string | string[]): boolean { ... }
  ```
  - 移动端不需要指令(uni-app 自定义指令在小程序不完整支持),用函数 + `v-if`
- **验收**: 在 setup 中能直接用 `v-if="hasPerm('xxx')"`

### T-182 dayjs 接入 + 时间格式化工具

- **类型**: feat
- **涉及文件**: `apps/app/src/utils/format.ts`
- **要点**:
  ```ts
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import relativeTime from 'dayjs/plugin/relativeTime';
  dayjs.extend(relativeTime);
  dayjs.locale('zh-cn');
  export function formatTime(d?: string | number | Date, pattern = 'YYYY-MM-DD HH:mm:ss'): string { ... }
  export function formatRelative(d?: string | number | Date): string { ... }
  ```
- **验收**: 列表的时间字段能格式化为友好显示(如"3 分钟前")

---

## S8 移动端 MVP 业务页面

> S8 是移动端的主战场,目标是让运营/业务方能在移动端用核心功能。下表是页面清单,每张卡 Codex 应实施完整可用的 UI + 接口对接 + 加载/错误态。

### T-800 完善登录页(账号密码 + 微信一键登录入口)

- 现状:已有账号密码,wxLogin/wxPhone 是死代码
- **要点**:
  - 主流程:账号密码登录 + 验证码(条件编译,见 T-083)
  - 副入口:微信小程序端显示"微信一键登录"按钮,调用 `authApi.wxLogin({ code })` + `authApi.wxPhone({ encryptedData, iv })`
  - 隐私协议必勾(应用商店审核硬要求,见 T-810)
  - 表单校验、错误提示
  - 记住账号(uni.setStorageSync)
- **验收**: H5 + 微信小程序两端登录链路均可用

### T-801 工作台(替换原首页)

- **页面**: `apps/app/src/pages/index/index.vue`(完全重做)
- **要点**:
  - 顶部:头像 + 昵称 + 当前租户名 + 角色标签
  - 数据卡片:今日待办数 / 未读通知数 / 在线状态
  - 快捷应用:**根据用户 permissions 动态生成**(替换硬编码 actions),从一个固定的"功能字典"过滤(在 `apps/app/src/config/quick-actions.ts` 维护:每条 action 含 perm + path + icon + label)
  - 公告横幅:轮播显示最新 3 条已发布公告
  - 下拉刷新 + 上滑加载
- **验收**:
  - [ ] 不同角色看到不同的快捷应用
  - [ ] 公告点击跳详情
  - [ ] 下拉刷新数据更新

### T-802 个人中心重构

- **页面**: `apps/app/src/pages/center/index.vue`
- **要点**:
  - 顶部:头像(可点击换头像)+ 昵称 + 部门 + 岗位
  - 菜单组(分组列表):
    1. 我的:消息 / 收藏(预留) / 待办
    2. 设置:个人资料 / 修改密码 / 通用设置(主题、字号、清缓存) / 关于我们
    3. 安全:登录设备(预留) / 退出登录
  - 角标:消息组件显示未读数(messageStore.unread)
- **验收**: 菜单点击跳对应页面;退出后 reLaunch 到登录页

### T-803 个人资料 / 修改密码(已有,补完整校验和 i18n)

- **要点**:
  - 表单校验完整
  - 头像上传走 `/api/file/upload` 带 bizType=avatar
  - 修改密码后清 token + 重新登录

### T-804 通知公告列表 + 详情

- **页面**:
  - `apps/app/src/pages/notice/list.vue`
  - `apps/app/src/pages/notice/detail.vue`
- **要点**:
  - 列表:按 publishAt desc 分页,显示标题 / 摘要 / 时间 / 类型标签
  - 详情:富文本展示(uniapp `rich-text` 组件 渲染 sanitize 后的 HTML)
  - 滑动删除(预留)
- **验收**: 列表 → 详情完整,空态友好

### T-805 消息中心(站内信)

- **页面**:
  - `apps/app/src/pages/message/list.vue`
  - `apps/app/src/pages/message/detail.vue`
- **后端依赖**: 03 文档已落地 `T-450 SysMessage 模型 + 站内信接口`(由本卡触发新增,详见 03 文档 T-450)
  - 详细字段与接口定义见 03 文档 T-450
- **要点**:
  - 列表分组:全部 / 未读
  - 进入消息列表自动 markRead(根据需求决定,默认手动)
  - 红点消失逻辑

### T-806 设置页(主题 + 字号 + 清缓存 + 版本检查)

- **页面**: `apps/app/src/pages/settings/index.vue`
- **要点**:
  - 主题切换:浅色 / 深色 / 跟随系统(uni.getSystemInfoSync().theme)
  - 字号:小 / 中 / 大(影响全局 rpx 缩放,通过 css 变量)
  - 清缓存:`uni.clearStorageSync()`(保留 token / userInfo)
  - 版本检查:对比 packageJson.version 与后端配置 `app.version.latest`
- **验收**: 主题切换刷新生效,清缓存后重要数据不丢

### T-807 关于我们 / 隐私协议 / 用户协议

- **页面**:
  - `apps/app/src/pages/about/index.vue`
  - `apps/app/src/pages/agreement/privacy.vue`
  - `apps/app/src/pages/agreement/terms.vue`
- **要点**:
  - 静态页面,内容从 SysConfig 读(`sys.app.privacyContent` / `sys.app.termsContent`)
  - 应用商店审核硬要求,所有协议必须可访问
- **验收**: 登录页能跳协议页;协议页可正常返回

### T-808 扫码入口

- **页面**: 个人中心 → 扫一扫
- **要点**:
  - `uni.scanCode({ scanType: ['qrCode', 'barCode'] })`
  - 扫码结果按 schema 处理:
    - `nap://login?code=xxx`:Web 端扫码登录(P2 backlog,目前不实现;若启用需后端新增临时 code 颁发与校验接口,后续单独建卡)
    - http/https:跳浏览器
    - 其他文本:显示在弹窗
- **验收**: H5 端用 file picker 替代,小程序端真扫;失败有 toast

### T-809 待办列表(简化版,挂在工作台 + 个人中心)

- **要点**:
  - 后端依赖:同 T-805,需要 `SysTodo` 模型(可与消息合并 type 区分)
  - 列表:待处理 / 已处理 tab
  - 点击跳对应业务详情(URL 由后端给)
- **验收**: list + 标记完成

### T-810 路由白名单 + 协议必勾

- **要点**:
  - 登录页底部协议勾选 + 链接
  - 未勾选时禁用登录按钮
  - 协议页路径加入 router-guard 白名单
- **验收**: 应用商店审核要点 ✅

### T-811 H5 vs 小程序差异化处理统计

- **要点**:
  - 列出全代码所有 `// #ifdef` 场景文档化(放到 `apps/app/PLATFORM-DIFF.md`)
  - 包含:文件上传、扫码、登录方式、deeplink、地图、支付(预留)
- **验收**: 文档存在,与代码一致

---

## 全部移动端任务卡总数

| Stage | 卡数 | 累计 |
| --- | --- | --- |
| S0 | 8  | 8 |
| S1 | 3  | 11 |
| S8 | 12 | 23 |

---

## 后端联动卡(由本文档触发,已在 03 文档落地)

- 后端 `T-450 SysMessage 模型 + 站内信接口`(由 T-805 触发)
- 后端 `T-451 SysTodo 用 SysMessage type=4 表达`(由 T-809 触发)
- 后端 `T-452 工作台 stats 接口`(GET /api/dashboard/overview,由 T-801 / 04 T-460 共用)
- 后端 `T-453 公告 banner 接口`(GET /api/system/notice/banner?limit=3,由 T-801 触发)

> Codex 在做 04/05 文档的卡时如果发现后端缺接口,**追加到 03 文档对应位置**(优先复用 T-450~T-459 段位),并在 commit 中说明。

---

完。下一份 `06-infra.md` 给出基础设施(workspace / Docker / CI / 测试)任务卡。
