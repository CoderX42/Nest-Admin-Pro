# 实施进度

> Codex 每完成一张任务卡,在本文件追加记录。本文件是 Codex 与人类协作者的同步面板。

## 当前 Stage

**S0 修血洞**(进行中)

---

## Stage 总览

- [ ] **S0 修血洞** — 三端能起来,登录链路打通
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
T-006 pending 2026-06-03 00:46:21 CST ConfigModule 加载 env 文件并用 zod 校验关键环境变量

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
