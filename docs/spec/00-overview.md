# 00 · 项目总览与实施路线图

> 本目录(`docs/spec/`)是 **Codex 完善 Nest-Admin-Pro 的施工蓝图**。所有文档以"任务卡"为最小执行单元,Codex 应严格按 Stage 顺序推进,跨 Stage 不得提前实现。
>
> 仓库内既有的 `docs/api.md` / `docs/development.md` / `docs/deployment.md` / `docs/faq.md` 已陈旧(部分仍引用旧目录名 `apps/api`、`apps/web`),本目录文档具有更高优先级,与之冲突时以 `docs/spec/` 为准。
>
> 本系列正文 8 份,加上 `INDEX.md` 索引与 `PROGRESS.md` 进度,共 10 个文件:
>
> - `INDEX.md` — 文档导航与任务卡 ID 区段总览(强烈建议第一份读)
> - `PROGRESS.md` — 实施进度看板,Codex 每完成一卡更新
> - `00-overview.md` 本文 — 总览、决策记录、路线图、协作约定
> - `01-conventions.md` 规范 — 目录、命名、API 契约、提交规范、TS 风格
> - `02-data-model.md` 数据模型 — Prisma schema 重写、迁移、seed
> - `03-backend.md` 后端任务卡
> - `04-fronted.md` Web 后台任务卡
> - `05-app.md` 移动端任务卡
> - `06-infra.md` 基础设施(workspace / Docker / CI / 测试 / 日志)
> - `07-themes.md` 主题系统(项目最末阶段)

---

## 1. 项目身份

Nest-Admin-Pro 是一个**多租户 RBAC 后台管理系统模板**,采用 monorepo 三应用结构:

| 子应用 | 路径 | 技术栈 | 端口(默认) |
| --- | --- | --- | --- |
| 后端 API | `apps/backend` | NestJS 11 + Prisma 5 + MySQL 8 + Redis 7 | 3000 |
| Web 后台 | `apps/fronted` | Vue 3 + Vite 5 + Element Plus 2 + Pinia 2 + Tailwind CSS 3 | 5173 |
| 移动端 | `apps/app` | UniApp 3 + Vue 3 + Pinia 2 | H5 5174 / 小程序按 IDE |

> ⚠️ `apps/fronted` 目录名是历史拼写错误(应为 `frontend`),为避免大规模重命名风险**保持不变**。所有文档与脚本以 `apps/fronted` 为准。

### 完成定义(Definition of Done)

整个项目交付目标为 **"内部生产可用"**:

1. 三端能用一行 `pnpm dev` 起来,默认账号 `admin / admin123` 登录直达仪表盘
2. RBAC + dataScope 5 档 + 多租户行级隔离全部生效
3. 系统管理 8 模块、监控 5 模块在 Web 端全部可用,含批量、导入导出、操作日志
4. 代码生成器能从一张 MySQL 业务表生成 controller/service/dto + Vue 列表页 + 路由,zip 下载或落盘
5. 定时任务能创建 cron job、动态调度、查看执行日志、暂停/恢复/手动触发
6. 移动端 MVP 上线,含工作台、通知、公告、消息、设置、扫码、登录守卫
7. backend e2e + fronted vitest 在 GitHub Actions 全绿
8. 6 套玻璃拟态主题可一键切换并持久化

---

## 2. 决策记录(ADR 摘要)

以下决策已与项目所有者对齐,文档其余部分以此为基线。Codex 不得擅自更改,如有强烈技术反对意见,在任务卡里 **明确写出风险后** 仍按本节执行。

| # | 决策 | 选择 | 理由 |
| --- | --- | --- | --- |
| ADR-01 | 项目完成度 | 内部生产可用 | 核心模块生产级,边缘模块允许有限 TODO |
| ADR-02 | 三端投入 | 三端均衡 | 移动端补到 MVP,与 Web 权限体系打通 |
| ADR-03 | 包管理 | **pnpm workspace** | 解决三应用各自 `npm install` 的痛点 |
| ADR-04 | 数据库迁移 | **prisma migrate** | 以 `prisma/migrations/` 纳入版本控制,替代 `db push` |
| ADR-05 | 表名命名 | **Sys/Gen 前缀 + snake_case**,业务表无前缀 | model 名保持 PascalCase,通过 `@@map` 映射到 snake_case 物理表名 |
| ADR-06 | 多租户隔离 | **行级 `tenant_id`** + Prisma 中间件全局注入 where | 简单、迁移成本低,业务表与部分系统表(用户/角色/部门/岗位/通知)隔离,菜单/字典/参数/文件存储配置 全局共享 |
| ADR-07 | 账号层级 | **三层**:超管(platform admin) / 租户管理员 / 租户用户 | 超管跨租户可见且能切换租户视图 |
| ADR-08 | dataScope | **5 档全做**,枚举值与 RuoYi 对齐:1 全部 / 2 自定义部门 / 3 本部门及以下 / 4 仅本部门 / 5 仅本人 | 通过装饰器 + 工具函数注入 where。完整枚举见 02 文档 § 7.1 |
| ADR-09 | 业务表 | **不预设业务表**,仅预留命名规范 + 代码生成器模板 | 后续业务由使用者用代码生成器扩展 |
| ADR-10 | 按钮权限指令 | **`v-perm`**(单数、短) | `v-perm="'system:user:add'"` 或 `v-perm="['a','b']"` 任一命中即放行 |
| ADR-11 | 主题 | 6 套玻璃拟态主题放在 **S10 末期** | 视觉非阻塞业务,放最后避免反复返工 |
| ADR-12 | 工程化 | workspace + Docker compose + 测试 + CI | 不上灰度/不上 APM,降一档复杂度 |
| ADR-13 | API 响应 | **统一 `{ code, data, message }`**,文件流/SSE 走 `@Res()` 旁路 | 与现有 TransformInterceptor 兼容,但需修复 Public 接口被误包 |
| ADR-14 | 鉴权 | **全局 JwtAuthGuard + `@Public()` 装饰器**,Roles/Permission Guard 路由级 | 修正现状(`@Public` 形同虚设) |
| ADR-15 | 文档语言 | **中文**,代码与命名英文 | 便于审阅 |

---

## 3. 阶段路线图

Codex 必须按 Stage 顺序执行,**Stage 内的任务卡可并行**(任务卡互相独立时),Stage 之间禁止跨越。每个 Stage 结束需提交 git commit 并通过其门禁条件。

| Stage | 名称 | 目标 | 门禁(必须通过才能进入下一 Stage) |
| --- | --- | --- | --- |
| **S0** | 修血洞 | 三端可启动,登录链路打通 | `pnpm install` 三端无报错;backend `pnpm --filter backend start:dev` 无 crash;Web `pnpm --filter fronted dev` 起到 5173;App H5 起到 5174 不白屏;admin 登录后菜单不空 |
| **S1** | 基础设施 | workspace 化、迁移化、容器化 | 根目录 `pnpm dev` 一行起 backend+fronted;`docker compose up` 起 mysql+redis+backend+fronted;`/health` 返回 200;pino 输出结构化 JSON |
| **S2** | 数据模型重整 | schema 加 `@@map`、补 `tenant_id`、补 `SysFile` 文档 | `pnpm --filter backend prisma:migrate:dev` 成功生成首个迁移;`prisma:seed` 注入完整种子数据;MySQL 中表名为 snake_case |
| **S3** | RBAC + 多租户 | 全局 JwtGuard 生效、Permission/Roles Guard、dataScope 5 档、Prisma tenantId 中间件 | e2e:无 token 401、错误角色 403、超管跨租户可见、租户用户跨租户不可见、dataScope 5 档全部覆盖 |
| **S4** | 系统管理完善 | 8 模块批量、Excel 导入导出、菜单树、操作日志真填充、文件管理 | 用户支持 Excel 导入导出和批量删除;菜单页树形缩进正确;操作日志 IP/UA/OS/浏览器解析无空字段 |
| **S5** | 监控完善 | ServerService 真出数、在线用户心跳、缓存监控权限收紧 | 服务监控页 CPU/内存/磁盘/进程真实数据;在线用户列表与 Redis TTL 一致 |
| **S6** | 代码生成器 | information_schema 真同步、Handlebars 模板、生成 controller/service/dto/Vue 列表页 + zip 下载 | 用一张测试业务表跑通"导入表 → 配置字段 → 预览 → 生成 zip" 全流程,生成的代码无需改动直接 build 通过 |
| **S7** | 定时任务 | Job CRUD + cron 解析 + 动态调度 + invokeTarget(beanName.method) + 执行日志 + 暂停/恢复/手动触发 + 前端页面 | 创建一个 `* * * * *` job 调用 demo handler,1 分钟内有日志写入;暂停后不再触发;手动触发立即执行 |
| **S8** | 移动端 MVP | pinia 接入、路由守卫、工作台、通知/公告、消息中心、设置、协议页、扫码入口 | H5 端完整跑通登录 → 工作台 → 公告详情 → 设置 → 退出;微信小程序能编译通过 |
| **S9** | 工程化收尾 | Vitest + Jest e2e + GitHub Actions | CI 流水线 lint/typecheck/test/build 全绿 |
| **S10** | 主题系统 | 6 套 CSS 变量主题 + 预览 + 持久化 | 6 个主题切换无残留、刷新后保留、主题色一致映射到 Element Plus token |

> 路线图共 11 个 Stage,任务卡总量约 **175 张**(详细分布见 `INDEX.md`)。每张卡都有唯一 ID `T-<stage><nn>`(如 `T-303`),Codex 在 commit message 中**必须**带卡号,便于追踪。

---

## 4. Codex 协作约定

### 4.1 任务卡格式

所有任务卡统一以下结构:

```markdown
### T-XXX 卡片标题

- **Stage**: S3
- **类型**: feat / fix / refactor / chore / docs / test
- **依赖**: T-XXX(如有,前置卡必须先完成)
- **上下文**: 1-3 句说明为什么要做这件事
- **涉及文件**:
  - `apps/backend/src/auth/jwt-auth.guard.ts`(新建/修改/删除)
- **实施要点**:
  1. 第一步具体怎么改
  2. 第二步具体怎么改
- **验收标准**:
  - [ ] 单测/e2e 用例编号或描述
  - [ ] 行为预期(如 401/200 状态码、UI 表现)
- **已知坑**: 与其他模块的隐式耦合、容易踩的边界
- **参考**: 链接其他卡片或外部文档
```

### 4.2 执行规则

1. **不跨 Stage**。比如 S0 没完成不许碰 S6 代码生成器。
2. **不擅自扩展**。任务卡没说要改的文件不要改;发现问题写新卡。
3. **每卡一 commit**。commit message 格式:`[T-XXX] <type>: <subject>`,如 `[T-301] feat: enable global JwtAuthGuard with @Public decorator`。
4. **卡内验收必须 ALL 通过** 才能 mark 完成。
5. **遇到歧义** 不要猜:在卡片下方追加 `### 阻塞问题` 段落,等用户回答再继续;不阻塞的可继续执行其他独立卡。
6. **测试与代码同卡**。任何 feat 卡必须包含至少一条 unit/e2e 验收用例,test 卡只用于纯补测试场景。
7. **禁止破坏既有可用功能**。S0 修复期间发现的"已能工作的功能"不要顺手重构;留到对应 Stage。
8. **代码风格**严格按 `01-conventions.md`。

### 4.3 工作目录假设

所有相对路径基于仓库根目录 `Nest-Admin-Pro/`。Codex 应在仓库根运行 pnpm 脚本,而不是 `cd apps/xxx && npm run`。S1 完成后,根目录 `package.json` 会提供:

```bash
pnpm dev               # 同时启动 backend + fronted(并发)
pnpm dev:backend       # 仅后端
pnpm dev:fronted       # 仅 Web
pnpm dev:app           # 仅 H5
pnpm build             # 三端依次 build
pnpm lint              # 三端 lint
pnpm test              # 三端 test
pnpm prisma:migrate    # 等价于 pnpm --filter backend prisma:migrate:dev
pnpm prisma:seed       # 等价于 pnpm --filter backend prisma:seed
pnpm db:reset          # drop + migrate + seed,仅本地用
```

### 4.4 与现有代码的兼容策略

- **删除 vs 保留**:遇到 README 已宣称但实际是占位的代码(如 `gen.service.ts` 的 stub),**重写**而非保留。
- **重命名**:`apps/fronted` 不重命名;其他文件遇到拼写错误可改正。
- **API 兼容**:S3 之前不要改任何已有接口路径(防止前端连不上);S3 起统一对齐 `01-conventions.md` 第 6 节 API 契约。
- **数据迁移**:S2 一次性建立首个迁移并清空 `prisma db push` 历史。本地开发者需要手动 `pnpm db:reset`,文档会在 S2 卡里明确说明。

---

## 5. 当前问题清单(由代码审计得出,作为 Codex 的工作起点)

> 这一节列出已发现但**尚未分卡**的问题,Codex 在写卡阶段需把它们全部转化为任务卡,并在 03/04/05 文档对应章节落地。

### 后端(`apps/backend`)

1. `@Public()` 装饰器无效 — AppModule 未挂全局 `JwtAuthGuard`(`apps/backend/src/app.module.ts:39`)
2. `RoleService.assignPermissions` 把 menuIds 写成 JSON 字符串,与隐式 m2m 表无关联(`apps/backend/src/modules/system/role/role.service.ts:64`)
3. `dept.service.ts:68`、`menu.service.ts:90` 用裸 `throw new Error(...)`,被全局过滤器变 500
4. `dataScope` 字段定义但全代码 0 处使用
5. `auth.service.ts:54,71` IP 写死 `'127.0.0.1'`,UA 未解析
6. `gen.service.ts` 全部 stub
7. `ServerService` 是空类(`apps/backend/src/modules/monitor/server/server.service.ts`)
8. `OperLogInterceptor` 不解析 X-Forwarded-For
9. `TransformInterceptor` 会把 `@Res()` 文件流也包成 ApiResponse
10. `GlobalExceptionFilter` 用 `error.message` 暴露内部异常
11. `(BigInt.prototype as any).toJSON` 副作用注入(`auth.service.ts:17`)
12. `nodemailer / @nestjs/schedule` 装了未用
13. 无 `.env` 强制加载、无 `JWT_SECRET` 生产断言
14. 无 `/health`、无 graceful shutdown、无 helmet/compression
15. 无任何测试
16. `SysRole.menuIds/deptIds/SysUser.postIds` 用 JSON 字符串而非关联表 — S2 重整时改为正规多对多关联表
17. `package.json` name 写成 "api",`main` 与 `start:prod` 路径不一致
18. `gen` 模块 controller 用 `@Body() dto: any`

### Web 后台(`apps/fronted`)

1. **依赖版本号大量造假** — `vue-router ^5.0.6` / `vite ^8.0.12` / `typescript ~6.0.2` / `vue-tsc ^3.2.8` / `@vue/tsconfig ^0.9.1` 均不存在,需全量重写 `package.json`(S0)
2. 6 套玻璃拟态主题完全未实现(S10 重做)
3. 动态路由未实现,`menuApi.buildRoute` 0 处调用
4. `v-perm` 指令缺失
5. ECharts 依赖装了但 0 处 import,Dashboard / 服务监控只用进度条
6. 公共组件库为空(SvgIcon / Pagination / Upload / DictTag / TreeSelect 全缺)
7. 代码生成器前端未对接
8. `request.ts` 强假设 `{code:200,data}` 包装,需与 ADR-13 对齐
9. `types/` 目录空,API 与 store 全 `any`
10. `SidebarMenu.vue` 用英文菜单名硬编码 i18n key,后端中文菜单名命中失败
11. dept/menu 树形数据未做表格层级缩进
12. online / config 页面无分页
13. 多页面分页代码重复
14. 路由守卫无 NProgress / 无 keepAlive / 无 tagsView
15. `HelloWorld.vue` 是 Vite 模板死代码

### 移动端(`apps/app`)

1. **pinia 未声明依赖且未 createPinia** — 应用启动即崩
2. `pages/index/index.vue:34` import 路径错误 `../stores/user` 应为 `../../stores/user`
3. `authApi.captcha()` 未定义,登录页首屏 TypeError(`apps/app/src/pages/login/index.vue:45`)
4. 登出 `switchTab` 跳到 center,应是 `reLaunch` 到登录页(`apps/app/src/pages/center/index.vue:76`)
5. baseURL 硬编码 `http://localhost:3000/api`,未抽 env 与平台条件编译
6. `manifest.json` appid 全空
7. `@vueuse/core` / `dayjs` 缺失
8. `vue-i18n` 装了 0 处使用
9. 全局无路由守卫
10. 业务页面薄到只能算脚手架

---

## 6. 文档维护规则

- 任务卡完成后:在原任务卡标题前加 `~~T-XXX~~`(GFM 删除线),保留卡片正文便于回溯
- 新发现的问题:写新卡,**不要改老卡的验收标准**(防止已通过的卡被无声修改)
- 决策变更:在本文 §2 的 ADR 表格上方追加 `### ADR 变更记录`,带日期
- 每个 Stage 收尾:在 `00-overview.md` 末尾追加 `## Stage Sx 收尾报告`,记录通过的门禁、未关闭的卡、遗留 TODO

---

## 7. 给 Codex 的开场白

第一次拿到本仓库时,**严格按以下顺序读文档**:

1. 本文(`00-overview.md`)
2. `01-conventions.md` — 命名、API 契约、TS 风格,**这是后续所有卡的基础**
3. `02-data-model.md` — schema 形态决定一切
4. 当前 Stage 对应的子文档(03/04/05/06/07)

读完后,在仓库根创建 `docs/spec/PROGRESS.md`,初始内容:

```markdown
# 实施进度

- [ ] S0 修血洞
- [ ] S1 基础设施
- [ ] S2 数据模型重整
- [ ] S3 RBAC + 多租户
- [ ] S4 系统管理完善
- [ ] S5 监控完善
- [ ] S6 代码生成器
- [ ] S7 定时任务
- [ ] S8 移动端 MVP
- [ ] S9 工程化收尾
- [ ] S10 主题系统

## 当前 Stage: S0

## 已完成卡片

(空)

## 阻塞问题

(空)
```

每完成一卡,更新 `已完成卡片` 列表,格式 `T-XXX commit-sha 一句话总结`。

完成。
