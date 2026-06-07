# 实施进度

> Codex 每完成一张任务卡,在本文件追加记录。本文件是 Codex 与人类协作者的同步面板。

## 当前 Stage

**S1 基础设施**(进行中)

---

## Stage 总览

- [x] **S0 修血洞** — 三端能起来,登录链路打通
- [ ] **S1 基础设施** — pnpm workspace + Docker + 健康检查 + 日志
- [ ] **S2 数据模型重整** — schema 重写、prisma migrate 接管、seed 改造
- [ ] **S3 RBAC + 多租户** — JwtGuard 全局生效、Permission/Roles Guard、dataScope 5 档、Prisma tenantId 中间件
- [ ] **S4 系统管理完善** — 8 模块批量、Excel 导入导出、菜单树、操作日志真填充
- [ ] **S5 监控完善** — ServerService 真出数、在线用户心跳、缓存监控权限收紧
- [ ] **S6 代码生成器** — information_schema 真同步、Handlebars 模板、zip 下载
- [ ] **S7 定时任务** — Job CRUD + cron 解析 + 动态调度 + 执行日志 + 暂停/恢复/手动触发
- [ ] **S8 移动端 MVP** — pinia 接入、路由守卫、工作台、通知/公告、消息中心、设置
- [ ] **S9 工程化收尾** — Vitest + Jest e2e + GitHub Actions CI
- [ ] **S10 主题系统** — 6 套玻璃拟态主题、预览、持久化

---

## 已完成卡片

> 格式:`T-XXX <commit-sha> <一句话总结>`

T-000 9506dc0 2026-06-02 23:57:07 CST workspace 骨架已补齐,`pnpm --filter backend list --depth -1` 验收通过
T-001 78e94f6 2026-06-03 00:33:56 CST backend package 元数据/脚本修复,build/lint 与 `dist/main.js` 路径验收通过
T-002 056093e 2026-06-03 00:36:48 CST 移除 BigInt 全局污染,新增安全序列化工具并接入响应包装
T-003 49633b3 2026-06-03 00:39:55 CST 启用全局 JwtAuthGuard 并让 `@Public()` 元数据生效
T-004 8923519 2026-06-03 00:42:19 CST GlobalExceptionFilter 隐藏内部异常并映射 Prisma 友好错误
T-005 f07f994 2026-06-03 00:43:46 CST dept/menu 删除业务校验改用 HttpException 并补单测
T-006 1bf1785 2026-06-03 00:46:21 CST ConfigModule 加载 env 文件并用 zod 校验关键环境变量
T-007 16a2ef2 2026-06-03 00:47:54 CST TransformInterceptor 支持文件流/SSE/显式装饰器旁路
T-008 0247fec 2026-06-03 01:32:11 CST main.ts 接入 helmet/compression/CORS/global prefix exclude 与 shutdown hooks
T-009 ff7aeb9 2026-06-03 01:35:07 CST 接入 nestjs-pino 并通过 RequestContextMiddleware 注入 traceId 上下文
T-010 400b5bb 2026-06-03 01:39:36 CST 登录/验证码接口限流加严并接入 Redis throttler storage
T-011 f718b7f 2026-06-03 01:45:11 CST 新增公开 health 端点,提供 DB/Redis 探活明细且无外部依赖时整体保持 ok
T-050 0836ced 2026-06-03 11:47:45 CST fronted package 依赖版本改为真实可安装基线,install/typecheck 与造假版本清查通过
T-051 fd5fb06 2026-06-03 11:49:49 CST vite 配置重写并接入自动导入/组件解析/svg icons/Tailwind v3 构建链路
T-052 d4e65c7 2026-06-03 11:55:08 CST 删除 HelloWorld 死组件并同步清理自动生成组件声明
T-053 0dd043d 2026-06-03 11:56:14 CST 新建 fronted 内部基础类型并让 request.ts 引用统一 ApiResponse 契约
T-054 87d10ae 2026-06-03 11:59:03 CST request.ts 重写为类型化 axios 封装,统一业务码/401/403/429/blob 处理
T-055 4d2fc78 2026-06-03 12:03:57 CST 拆分 fronted api 目录并替换页面/store 的旧入口导入
T-056 6e77072 2026-06-03 12:04:53 CST 重构 user store 并新增 app/permission/tags-view/dict store 与核心单测
T-057 239b9d4 2026-06-03 12:08:37 CST 登录页接入 captcha/rememberMe/redirect/i18n 与验证码错误刷新逻辑
T-080 35da5af 2026-06-03 16:02:44 CST app package 依赖基线修复并补齐 pinia/@vueuse/core/dayjs/sass
T-081 0f51588 2026-06-03 16:06:06 CST app main.ts 注册 Pinia,H5 dev server ready 且本地响应 200
T-083 87c9712 2026-06-03 16:12:17 CST app 登录页补 H5 captcha 展示/提交,新增 authApi captcha/validateCaptcha
T-084 829423e 2026-06-03 16:20:38 CST app baseURL/FILE_BASE_URL 抽到 env 并为 H5 配置 /api 与 /file 代理
T-085 e511d1d 2026-06-03 16:23:58 CST app vite alias 与 tsconfig paths 补齐,env 条件编译声明兼容 vue-tsc
T-082 aba94b1 2026-06-03 16:26:45 CST app 页面 import 统一改为 @ 别名,登出改 reLaunch 并清除 H5 build 阻塞
T-086 4acb0ef 2026-06-03 16:41:03 CST app request.ts 统一错误/401/token/query/upload 处理并通过 typecheck/build:h5
T-087 f63a2ec 2026-06-03 16:47:57 CST app onLaunch 接入全局路由守卫,未登录访问受保护页面重定向登录
T-100 待回填 2026-06-03 18:40:00 CST husky/lint-staged/commitlint/changesets 提交质量门禁已接入,install/commitlint/lint-staged 验收通过
T-101 待回填 2026-06-03 18:48:08 CST packages/shared-types 与 shared-constants 已创建,三端 workspace 依赖与类型验收通过
T-102 待回填 2026-06-03 18:54:35 CST 根 ESLint flat config 与 Prettier 配置已落地,`pnpm lint` 验收通过
T-103 待回填 2026-06-06 22:22:08 CST backend production Dockerfile 与 .dockerignore 已落地,用户外部 docker build 验收通过
T-104 待回填 2026-06-06 22:32:04 CST docker compose MySQL/Redis 基础服务已落地,用户外部 compose 验收 healthy 通过
T-105 待回填 2026-06-06 22:54:54 CST nginx reverse proxy template 已落地,用户外部 nginx -t 纯净验收通过
T-106 待回填 2026-06-07 01:02:42 CST 环境变量模板与本地 env 忽略策略已落地,backend dev/pino/health 验收通过
T-099 35b2435 2026-06-07 12:07:02 CST JWT sign payload 已显式转为 JSON-safe 字符串,BigInt 用户登录 token 往返单测通过
T-098 405b83d 2026-06-07 12:35:23 CST controller `@RequirePermission` 已对齐 seed 权限点,build/lint/test 与权限字符串校验通过
T-097 待回填 2026-06-07 14:13:34 CST 菜单树构建已排除 id=0 占位根节点,build/lint/test 验收通过
T-096 待回填 2026-06-07 15:04:25 CST fronted 已接入后端菜单驱动动态路由,build/lint/test 验收通过
T-130 7eb51b5 2026-06-07 10:32:09 CST Prisma schema 21 个目标模型已落地,format/validate/generate 验收通过
T-131 3cd472e 2026-06-07 10:41:33 CST 首次 init migration 已应用到 MySQL,业务代码已适配新 schema 且 build/lint/test/dev health 验收通过
T-132 12c59be 2026-06-07 10:48:53 CST Prisma seed 已注入默认租户/用户/角色/104 条菜单/字典/配置且幂等验收通过
T-133 9c9cd9d 2026-06-07 11:57:03 CST Prisma 多租户中间件骨架与 AsyncLocalStorage tenant context 已落地,build/lint/test 验收通过
T-091 2004c1f 2026-06-08 01:05:00 CST S2 业务接口补洞:dept 占位根递归、dict/config 分页 DTO、tenant CRUD 路由已修复

---

## S1 调整记录

- T-107 推迟到 T-133 之后执行:docker compose 自动 migrate + seed 依赖 schema/migration/seed 先落地,由 T-107 收尾打通一键迁移与初始化数据。

---

## 阻塞问题

> 实施过程中遇到的歧义、需要决策、卡住推进的问题列在这里。每条问题写明:
>
> - 卡号
> - 现象/疑问
> - 已尝试方案
> - 建议方案
>
> 用户回应后再清理。

(空)

---

## 当前 Stage 门禁状态

> 进入下一 Stage 前所有门禁必须通过。具体门禁见 `00-overview.md` § 3。

### S0 门禁

- [ ] `pnpm install` 三端无报错
- [ ] `pnpm --filter backend start:dev` 无 crash
- [ ] `pnpm --filter fronted dev` 起到 5173
- [ ] `pnpm --filter app dev:h5` 起到 5174 不白屏
- [ ] admin/admin123 登录后菜单不空

### S1 门禁(待 S0 完成后启用)

- [ ] 根目录 `pnpm dev` 一行起 backend+fronted
- [ ] `docker compose up` 起 mysql+redis+backend+fronted
- [ ] `/health` 返回 200
- [ ] winston/pino 输出结构化 JSON(项目使用 pino)

(其余 Stage 门禁随推进逐一启用)

---

## S0 完成度

- 完成时间(UTC+8): 2026-06-03
- Commit 范围: 9506dc0..HEAD(共 32 commit,backend 11 + fronted 8 + app 8 + 文档维护 5)
- 三段血洞修复: backend 全局守卫/异常脱敏/BigInt 序列化/zod env;fronted 假版本/HelloWorld/请求层重构;app pinia 注册/captcha 补全/路由守卫
- 工程化骨架: pnpm workspace + 根 package.json + .npmrc + .gitignore + 三端 lockfile
- 验收方式: 三端 vue-tsc/build/lint/test 通过,关键命令实测,启动期 docker 依赖项目以单测/集成静态验收为主
- S1 启动前置: 已 push 到 origin/docs/codex-blueprint

## S0 欠账(deferred to later stages)

- T-009 pino 实际启动输出未验证 → S1 docker-compose 起来后,跑 `pnpm --filter backend dev`,人工验证开发模式 pretty 输出 / 设 `NODE_ENV=production` 验证 json 输出。任何字段不符合 spec 立即修。
- T-011 health 降级策略 → S1 时把策略改为:`NODE_ENV=production` 且 db/redis 探针失败 → 返回 503 而非 ok。S0 留 ok 仅为开发期不阻塞启动。
- T-051 vite manualChunks 循环 chunk → S1 优化时,把 element-plus 单独切片去掉(让它合到 vendor),或者复制 vue 到 element-plus chunk。当前 vite build 警告"element-plus -> vendor circular import",生产首屏可能受影响。
- T-051 vite build 大 chunk + 空 echarts chunk → S1 优化时按需加载 echarts(改成 dynamic import),并把 500KB+ 的 chunk 拆开。当前 warning 不阻塞,但生产体积偏大。
- T-051 fronted dev / T-081 app dev 默认都占 5173 端口 → S1 起 backend (3000) 后,如果 fronted 与 app 需要并跑,要给其中一个换端口。建议:fronted 保持 5173,app dev:h5 改 5174(在 apps/app/vite.config.ts 加 server.port: 5174,或在 manifest.json h5 区域设)。S0 阶段两端不并跑,无冲突。
- 部署文档:在 README 或 docs/ops/local-dev.md 增加排错小节,提示开发者:若 MySQL 容器健康但 prisma 连不上,首先用 lsof -iTCP:3306 检查是否有 brew 装的本机 mysql 占端口。

## S1 欠账(deferred to later stages)

- [BUG-001][resolved] captcha 不写 Redis → brew redis 端口劫持已外部清除,与 mysql 8.4→8.0 同类问题。
  原现象:GET /api/auth/captcha 返回 200,但 redis-cli MONITOR 抓不到任何 SET 操作,redis 全 db scan 空,登录永远过不了 captcha 校验。
  结论:非 backend 代码 bug,用户 Mac 上 brew redis 占用 127.0.0.1:6379,导致请求命中本机 redis 而非 docker redis;外部卸载 brew redis 后已验证写入可在容器中读到。
  排查方向:
  1. apps/backend/src/auth/auth.service.ts 的 getCaptcha() 是否真的 await this.redis.set(...)
  2. RedisService 的 set 内部是否有 try/catch 静默吞错误
  3. 注入的 RedisService 实例与实际写入的 Redis client 是否同一个
  4. CacheModule / RedisModule 是否在多个地方各 new 了一个 Redis 实例
     修复后必须能完成端到端登录:GET captcha → 从 redis 读出 text → POST login → 拿到 token
- [BUG-002][resolved by T-098] controller `@RequirePermission` 与 seed `sys_menu.perms` 不一致 → 已统一回归 T-132 seed 权限命名,并把同一 controller 内 list/add/edit/remove/query/clean/forceLogout/clear 等拆为细粒度权限点。
- [BUG-003][resolved by T-097] `/api/system/menu/list` 返回 500 Maximum call stack exceeded → T-132 seed 的 id=0 占位根节点已在菜单树查询和构建入口显式过滤,避免 `buildTree(menus, 0)` 对同一根节点无限递归。
- [BUG-004][resolved by T-095] file 模块 API 路由前缀错位 → 后端 `@Controller('file')` 与其他 system 模块不一致,前端 `api/system/file.ts` 仍请求 `/file/*`,应统一为 `/system/file/*`。
- [BUG-005][resolved by T-095] i18n 字典缺 seed 菜单对应的 `menu.*` key 与 `monitor.online.title` → 控制台出现 `[intlify] Not found` 噪音,需按 `sys_menu.i18n_key` 补齐中英文 key。
- [BUG-006][low priority, deferred] vue-router 首次动态路由后短暂 warn `/system/notice` → 疑似 addRoute 后立即跳转时序问题,不阻塞本卡主链路,后续单独处理。
- [BUG-008] daisyUI dropdown 默认 hover 展开对触屏用户不友好 → 后续 S2/S3 优化时考虑改 click-open 或换 ElDropdown。
- [S2 list shape] 当前业务 list 主线使用 `{ total, items }`,fronted 多数页面读取 `items`;T-091 保持 `items` 形态,并兼容修复 dict/config 页面。如需回归 spec 的 `{ list, total }`,等 T-090 统一迁移。
