# Nest-Admin-Pro 实施蓝图 · 文档索引

> 这是 Codex 完善整个系统的入口。**第一次接手本仓库时,严格按以下顺序读文档**;读完再去 `PROGRESS.md` 认领当前 Stage。

---

## 文档导航

| 文档 | 内容 | 适合何时读 |
| --- | --- | --- |
| [00-overview.md](./00-overview.md) | 项目身份、15 条 ADR、11 阶段路线图、协作约定、现状问题清单 | 必读,第一份 |
| [01-conventions.md](./01-conventions.md) | 目录、命名、Prisma 映射、API 契约、TS 风格、依赖版本基线、env 变量 | 必读,第二份。后续所有任务卡引用本文 |
| [02-data-model.md](./02-data-model.md) | Prisma schema 完整重写、迁移与 seed、租户中间件、dataScope 实现 | 必读,第三份 |
| [03-backend.md](./03-backend.md) | 后端任务卡(60+ 张):S0 修血洞 → S7 定时任务 | 实施 backend 时按需读 |
| [04-fronted.md](./04-fronted.md) | Web 后台任务卡(46 张):依赖修复 / 动态路由 / v-perm / 公共组件 / 所有页面 | 实施 fronted 时按需读 |
| [05-app.md](./05-app.md) | UniApp 移动端任务卡(23 张):崩溃修复 / pinia / 工作台 / 通知 / 消息 / 设置 | 实施 app 时按需读 |
| [06-infra.md](./06-infra.md) | 基础设施任务卡(17 张):workspace / Docker / Nginx / CI / 测试 / 日志 | S1 / S9 时读 |
| [07-themes.md](./07-themes.md) | 6 套玻璃拟态主题(8 张):CSS 变量、切换 UI、ECharts 联动 | S10 末期读 |
| [PROGRESS.md](./PROGRESS.md) | 实时进度看板,Codex 每完成一卡更新一次 | 每次启动会话先看 |

---

## 阶段速览(总 11 个 Stage,~165 张任务卡)

| Stage | 名称 | 主要文档 | 卡数估算 |
| --- | --- | --- | --- |
| S0 | 修血洞 | 03 / 04 / 05 各自的 S0 段 | 27 |
| S1 | 基础设施 | 06 + 03 S1 | 13 |
| S2 | 数据模型重整 | 02 + 03 S2 | 15 |
| S3 | RBAC + 多租户 + 动态路由 | 03 S3 + 04 S3 | 16 |
| S4 | 系统管理完善 | 03 S4(含联动卡)+ 04 S4 | 25 |
| S5 | 监控完善 | 03 S5 + 04 S5 | 8 |
| S6 | 代码生成器 | 03 S6 + 04 默认页 T-463 | 8 |
| S7 | 定时任务 | 03 S7 + 04 S7前端 | 9 |
| S8 | 移动端 MVP | 05 S8 | 12 |
| S9 | 工程化收尾 | 06 S9 | 3 |
| S10 | 主题系统 | 07 | 8 |

---

## 任务卡 ID 区段总览(避免撞号)

| 区段 | 用途 |
| --- | --- |
| T-001 ~ T-011 | backend S0 |
| T-050 ~ T-057 | fronted S0 |
| T-080 ~ T-087 | app S0 |
| T-100 ~ T-113 | infra S1(workspace / Docker / Nginx / 文档脚手架) |
| T-120 | infra 监控(Sentry,可选 P1) |
| T-130 ~ T-139 | backend S1 |
| T-150 ~ T-152 | fronted S1 |
| T-180 ~ T-182 | app S1 |
| T-200 ~ T-212 | data-model S2 |
| T-220 ~ T-222 | backend S2 适配 |
| T-300 ~ T-310 | backend S3 |
| T-350 ~ T-354 | fronted S3 |
| T-400 ~ T-410 | backend S4 + fronted S4(同号同主题配对) |
| T-450 ~ T-459 | backend S4 联动卡(消息/待办/dashboard/banner,预留 5 张备用) |
| T-460 ~ T-463 | fronted 默认页(仪表盘/个人中心/错误页/代码生成器页) |
| T-470 ~ T-478 | fronted 公共组件 |
| T-500 ~ T-504 | backend S5(含 IP 归属地) + fronted S5(同号配对) |
| T-600 ~ T-606 | backend S6 |
| T-700 ~ T-706 | backend S7 |
| T-750 ~ T-751 | fronted S7 |
| T-800 ~ T-811 | app S8 |
| T-900 ~ T-903 | infra S9 |
| T-A00 ~ T-A07 | S10 主题 |

> commit message 格式:`[T-XXX] <type>(<scope>): <subject>`(详见 01 文档 § 9.2)。
> 同号但不同 scope 的卡片(如 backend T-400 vs fronted T-400)允许并存,因 commit scope 已区分。

---

## 关键决策一句话(详见 00 ADR 表)

- **完成度**:内部生产可用(核心生产级,边缘允许 TODO)
- **三端均衡**:Web + 移动端 + 后端
- **多租户**:行级 `tenant_id`,Prisma 中间件全局拦截
- **数据权限**:dataScope 5 档(枚举值与 02 § 7.1 严格对齐)
- **账号层级**:平台超管 / 租户管理员 / 租户用户 三层
- **包管理**:pnpm workspace
- **数据库**:prisma migrate(放弃 db push)
- **表名**:`Sys`/`Gen` 前缀 + snake_case,业务表无前缀
- **权限指令**:`v-perm`
- **响应格式**:`{ code, data, message }`,文件流/SSE 旁路
- **日志**:nestjs-pino 结构化
- **主题**:6 套玻璃拟态,放最后做
