# AGENTS.md — Codex 实施指南

> 你是被授权来完善 **Nest-Admin-Pro** 全栈管理系统的 Codex Agent。本仓库已有完整施工蓝图,你的任务是按蓝图严格执行。

---

## 必读文档(按顺序)

每次会话开始时,**必须先读以下文件**,理解上下文后再动手:

1. `docs/spec/INDEX.md` — 文档导航 + 任务卡 ID 区段总览
2. `docs/spec/PROGRESS.md` — 当前进度,明确正在哪个 Stage、已完成哪些卡、有无阻塞
3. `docs/spec/00-overview.md` — 15 条 ADR + 11 阶段路线图 + 协作约定
4. `docs/spec/01-conventions.md` — 命名 / API 契约 / TS 风格 / 提交规范
5. `docs/spec/02-data-model.md` — Prisma schema 与多租户机制
6. 当前 Stage 对应的 `03-backend.md` / `04-fronted.md` / `05-app.md` / `06-infra.md` / `07-themes.md`

---

## 工作纪律(不可违反)

1. **严格按 Stage 顺序**:S0 → S1 → ... → S10。Stage 内任务卡可并行,**Stage 之间不许跨越**
2. **一卡一 commit**:commit message 格式 `[T-XXX] <type>(<scope>): <subject>`,scope ∈ `backend / fronted / app / infra / docs / db`
3. **任务卡的"涉及文件"是上限**,不是建议。**不在卡内的文件不要改**(发现新问题写新卡)
4. **每张卡的"验收标准"必须全部通过**才能 mark 完成。打钩 = 实测过,不是看代码觉得应该没问题
5. **遇到歧义先记 PROGRESS.md 的"阻塞问题",不要猜**。可以继续做不依赖该问题的其他卡;有依赖的就停下
6. **不擅自重构**:S0 期间发现"已能工作的代码"不要顺手优化,留到对应 Stage
7. **代码风格严格按 `01-conventions.md`**(禁用 `any`、单引号、ESM、kebab-case 文件名等)
8. **测试与代码同卡**:任何 feat 卡必须包含至少一条 unit / e2e 验收用例
9. **每完成一卡更新 `docs/spec/PROGRESS.md`**:在"已完成卡片"区追加 `T-XXX <commit-sha-7> <一句话总结>`
10. **每完成一个 Stage 在 PROGRESS.md 勾选门禁,并在 00-overview.md 末尾追加 Stage 收尾报告**

---

## 关键决策速查(以 ADR 为准,详见 00-overview.md § 2)

- 项目目标:**内部生产可用**(核心生产级,边缘允许有限 TODO)
- 包管理:**pnpm workspace**,Node 20.x LTS
- 数据库:**prisma migrate**(放弃 `db push`),MySQL 8 + Redis 7
- 表名:`Sys` / `Gen` 前缀 + snake_case,`@@map` 显式映射;业务表无前缀
- 多租户:**行级 `tenant_id`** + Prisma 中间件全局拦截
- 账号层级:**3 层** — 平台超管 / 租户管理员 / 租户用户
- dataScope:**5 档**(枚举值与 02 文档 § 7.1 严格对齐:1 全部 / 2 自定义 / 3 本部门及以下 / 4 仅本部门 / 5 仅本人)
- 鉴权:**全局 JwtAuthGuard + `@Public()` 装饰器**,Roles/Permission Guard 路由级
- 前端按钮权限:**`v-perm`** 指令(`v-perm="'system:user:add'"` 或数组)
- API 响应:统一 `{ code, data, message }`,文件流 / SSE 旁路
- 日志:**nestjs-pino** 结构化(不是 winston)
- 主题:**6 套玻璃拟态**,放 S10 末期
- 文档目录 `apps/fronted` 是历史拼写错,**保持不动**

---

## 当前已知关键缺陷(S0 主战场)

后端:
- `auth.service.ts:17` 全局污染 `BigInt.prototype.toJSON`,删除并改用 `stringifyBigInt` 工具(T-002)
- `app.module.ts` 未挂全局 `JwtAuthGuard`,`@Public()` 形同虚设(T-003)
- `dept.service.ts:68`、`menu.service.ts:90` 用裸 `throw new Error`,被全局过滤器变 500(T-005)
- `nodemailer` / `@nestjs/schedule` 已装但 0 处使用(T-133)

Web 端:
- `apps/fronted/package.json` 中 `vue-router ^5.0.6` / `vite ^8.0.12` / `typescript ~6.0.2` 在 npm 上**都不存在**,安装必失败 — 必须按 `01-conventions.md § 15.2` 重写(T-050)

移动端:
- pinia 未声明依赖且未在 main.ts 注册,启动即崩(T-080 + T-081)
- `pages/index/index.vue:34` import 路径错(T-082)
- 登录页调用未定义的 `authApi.captcha()`(T-083)

---

## 命令备忘(S1 完成后可用)

```bash
pnpm dev               # 同时启 backend + fronted
pnpm dev:backend
pnpm dev:fronted
pnpm dev:app           # H5
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma:migrate    # = pnpm --filter backend prisma:migrate:dev
pnpm prisma:seed
pnpm db:reset
pnpm docker:up         # 一键启全栈容器
```

S0/S1 之前先用 `pnpm --filter <app>` 形式。

---

## 默认账号

```text
用户名:admin
密码:admin123
```

S2 seed 后还会有 `tenantadmin / admin123`(演示租户管理员)与 `user / admin123`(演示租户普通用户)。

---

## 当卡住时

- 按 ID 顺序找下一张**无依赖**的卡继续
- 把阻塞问题写到 `docs/spec/PROGRESS.md` 的"阻塞问题"段,**不要瞎编实现猜决策**
- 验收失败时**不要降低验收标准**,优先排查根因

---

## 不要做的事

- 不要修改 `docs/spec/00 ~ 07.md` 的决策内容(发现错误可在 PROGRESS.md 标注后等用户确认)
- 不要改 git config,不要 force push
- 不要跳过 pre-commit hook(`--no-verify`)
- 不要删除 `apps/fronted` 目录名(拼写错也保留)
- 不要为应付验收写 stub / mock 数据冒充真实实现
- 不要为追求"完美"超出任务卡范围(过度工程是本项目最大风险)
