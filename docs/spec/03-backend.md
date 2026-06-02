# 03 · 后端任务卡(NestJS)

> 本文档枚举 `apps/backend` 全部任务卡。Codex 严格按 Stage 顺序执行,Stage 内可并行;每张卡有验收标准(checklist),全部勾选才能 mark 完成。
>
> commit message 格式:`[T-XXX] <type>(backend): <subject>`(详见 `01-conventions.md` § 9.2)

---

## S0 修血洞(让后端能起来,登录链路打通)

### T-000 chore(infra): bootstrap pnpm workspace skeleton

- **类型**: chore
- **目标**: 让 `pnpm --filter <pkg>` 在根目录可用,解锁所有 S0 验收
- **涉及文件**:
  - `package.json`(新建)
  - `pnpm-workspace.yaml`(新建)
  - `.npmrc`(新建)
  - `docs/spec/03-backend.md`
  - `docs/spec/INDEX.md`
  - `docs/spec/PROGRESS.md`
  - `docs/spec/06-infra.md`
- **实施要点**:
  1. 根目录 `package.json` 声明 `pnpm@9.0.0`、Node/pnpm engines 与三端基础脚本
  2. `pnpm-workspace.yaml` 纳入 `apps/*`
  3. `.npmrc` 固定 workspace 安装策略
  4. 将 S1 的 T-100 从 workspace 骨架改为 husky/lint-staged/commitlint/changesets 加固
- **验收**:
  - [ ] `pnpm --filter backend list --depth -1` 不报 `ERR_PNPM_NO_PKG_MANIFEST`,输出 backend 包信息

### T-001 修复 package.json 元数据与脚本

- **类型**: chore
- **上下文**: `package.json` name 为 "api"、main/start:prod 路径不一致、缺 lint/test/prisma 脚本
- **涉及文件**: `apps/backend/package.json`
- **涉及文件补充**:
  - `pnpm-lock.yaml`(package 变更生成)
  - `apps/backend/eslint.config.js`(S0 最小 lint 配置,严格规则留到 T-102)
  - `apps/backend/src/modules/file/file.controller.ts`(修复 T-001 build 暴露的 Multer 类型编译错误)
  - `apps/backend/src/modules/file/file.service.ts`(修复 T-001 build 暴露的配置 Map 类型编译错误)
  - `apps/backend/src/modules/file/storage/*.ts`(修复 T-001 build 暴露的 Multer 类型编译错误)
  - `apps/backend/tsconfig.json`(修复 build 产物路径为 `dist/main.js`)
- **实施要点**:
  1. `name` 改为 `@nest-admin-pro/backend`
  2. `main` 改为 `dist/main.js`,`start:prod` 改为 `node dist/main.js`
  3. 补 scripts:
     ```json
     {
       "scripts": {
         "build": "nest build",
         "start": "nest start",
         "start:dev": "nest start --watch",
         "start:debug": "nest start --debug --watch",
         "start:prod": "node dist/main.js",
         "lint": "eslint \"src/**/*.ts\" --max-warnings 0",
         "lint:fix": "eslint \"src/**/*.ts\" --fix",
         "format": "prettier --write \"src/**/*.ts\"",
         "test": "jest",
         "test:watch": "jest --watch",
         "test:cov": "jest --coverage",
         "test:e2e": "jest --config ./test/jest-e2e.json",
         "prisma:generate": "prisma generate",
         "prisma:migrate:dev": "prisma migrate dev",
         "prisma:migrate:deploy": "prisma migrate deploy",
         "prisma:seed": "prisma db seed",
         "prisma:studio": "prisma studio",
         "db:reset": "prisma migrate reset --force"
       }
     }
     ```
  4. 移除 `nodemailer` 依赖(0 处使用)
- **验收**:
  - [ ] `pnpm --filter backend build` 成功
  - [ ] `pnpm --filter backend lint` 命令存在且能执行(零警告门禁推迟到 T-102 ESLint 配置就绪后再启用)
  - [ ] `node dist/main.js` 路径正确

### T-002 移除 BigInt 全局污染,启用安全序列化

- **类型**: refactor
- **上下文**: `apps/backend/src/auth/auth.service.ts:17` 用 `(BigInt.prototype as any).toJSON = ...` 全局注入,污染所有 JSON 序列化
- **涉及文件**:
  - `apps/backend/src/auth/auth.service.ts`(删除全局污染)
  - `apps/backend/src/common/utils/bigint.util.ts`(新建)
  - `apps/backend/src/common/interceptors/transform.interceptor.ts`(集成)
- **实施要点**:
  1. 新建 `bigint.util.ts`:
     ```ts
     export function stringifyBigInt<T>(input: T): T {
       if (input === null || input === undefined) return input;
       if (typeof input === 'bigint') return input.toString() as unknown as T;
       if (Array.isArray(input)) return input.map(stringifyBigInt) as unknown as T;
       if (input instanceof Date) return input;
       if (typeof input === 'object') {
         const out: Record<string, unknown> = {};
         for (const k of Object.keys(input)) out[k] = stringifyBigInt((input as Record<string, unknown>)[k]);
         return out as T;
       }
       return input;
     }
     ```
  2. `TransformInterceptor` 在 `map` 阶段调用 `stringifyBigInt(data)` 后再包装 ApiResponse
  3. 删除 `auth.service.ts:17` 的副作用注入
- **验收**:
  - [ ] 单测:`stringifyBigInt({ id: 1n, list: [{ id: 2n }] })` → `{ id: '1', list: [{ id: '2' }] }`
  - [ ] e2e:`/api/auth/getUserInfo` 返回的 `id` 字段为 string
  - [ ] grep 全代码无 `BigInt.prototype` 字样
- **已知坑**: 必须在 ApiResponse 包装前转,否则外层 `code/message` 不变化但内层 `data` 仍可能含 BigInt

### T-003 启用全局 JwtAuthGuard,使 @Public 真正生效

- **类型**: feat
- **上下文**: `@Public()` 装饰器存在但 AppModule 未挂全局 Guard,所有 controller 都得手挂 `@UseGuards(JwtAuthGuard)`,易漏鉴权
- **涉及文件**:
  - `apps/backend/src/app.module.ts`
  - `apps/backend/src/common/guards/jwt-auth.guard.ts`(新建/迁移)
  - `apps/backend/src/common/decorators/public.decorator.ts`
- **实施要点**:
  1. `Public` 装饰器:
     ```ts
     export const IS_PUBLIC_KEY = 'isPublic';
     export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
     ```
  2. `JwtAuthGuard` 继承 `AuthGuard('jwt')`,在 `canActivate` 中读 reflector:
     ```ts
     const isPublic = this.reflector.getAllAndOverride<boolean>(
       IS_PUBLIC_KEY,
       [context.getHandler(), context.getClass()],
     );
     if (isPublic) return true;
     return super.canActivate(context);
     ```
  3. AppModule providers:
     ```ts
     { provide: APP_GUARD, useClass: JwtAuthGuard }
     ```
  4. 移除所有 controller 上的 `@UseGuards(JwtAuthGuard)`,只保留必要的角色/权限 guard
  5. 给 `auth.controller.ts` 的 `login`、`register`、`captcha`、`captcha/validate` 加 `@Public()`
  6. 给 `health.controller.ts` 加 `@Public()`(配合 T-011)
- **验收**:
  - [ ] e2e:无 token 访问 `/api/system/user` → 401
  - [ ] e2e:无 token 访问 `/api/auth/login` → 200(若参数有效)
  - [ ] e2e:无 token 访问 `/api/health` → 200
- **已知坑**: 全局 JwtGuard 后,Swagger UI(`/doc.html` `/api-docs`)的静态资源也会被拦,需在 main.ts 把 swagger 路径加白名单或在 SwaggerModule 设置 `useGlobalGuards = false`

### T-004 GlobalExceptionFilter 不泄漏内部异常

- **类型**: fix
- **上下文**: 当前 `error.message` 直接做响应 message,会暴露 SQL/Prisma 错误细节
- **涉及文件**: `apps/backend/src/common/filters/global-exception.filter.ts`
- **实施要点**:
  1. `HttpException`:照常返回 `getResponse()` 的 message
  2. `Prisma.PrismaClientKnownRequestError`:按错误码映射友好消息(P2002 → "数据已存在",P2025 → "记录不存在")
  3. 其他 Error:生产环境返回 `服务器内部错误`,日志输出原始 stack
  4. 必填字段:`code`、`message`、`timestamp`、`path`、`requestId`(从 ALS 上下文取)
  5. 用 `pinoLogger.error` 记录完整异常,带 `traceId / userId / tenantId / path / payload`
- **验收**:
  - [ ] 单测:Prisma P2002 抛出 → 响应 message 为 "数据已存在",code=409
  - [ ] 单测:`new Error('secret leak')` 在生产环境 → message="服务器内部错误"
  - [ ] e2e:故意触发 500 → 响应不含原始 stack
- **已知坑**: NestJS 的 HttpException 在 NotFoundException 等子类下 `getResponse()` 返回字符串,需兼容

### T-005 修复裸 throw new Error 为 HttpException

- **类型**: fix
- **上下文**: `dept.service.ts:68`、`menu.service.ts:90` 用 `throw new Error('Cannot delete...')`,被全局过滤器误判为 500
- **涉及文件**:
  - `apps/backend/src/modules/system/dept/dept.service.ts`
  - `apps/backend/src/modules/system/menu/menu.service.ts`
  - 全代码搜 `throw new Error`,逐个修复
- **实施要点**:
  - 业务校验失败 → `BadRequestException`
  - 权限不足 → `ForbiddenException`
  - 资源不存在 → `NotFoundException`
  - 状态冲突 → `ConflictException`
- **验收**:
  - [ ] grep `throw new Error` 在 src 下命中 0
  - [ ] e2e:删除有子部门的部门 → 400 而非 500

### T-006 加载 .env 与启动期 env 校验

- **类型**: feat
- **上下文**: ConfigModule 未指定 `envFilePath`,`JWT_SECRET` 默认值在生产未断言
- **涉及文件**:
  - `apps/backend/src/config/env.config.ts`
  - `apps/backend/src/config/env.validation.ts`(新建,使用 zod)
  - `apps/backend/src/app.module.ts`
- **实施要点**:
  1. ConfigModule 配置:
     ```ts
     ConfigModule.forRoot({
       isGlobal: true,
       envFilePath: ['.env.local', '.env'],
       validate: envValidate,
     })
     ```
  2. `env.validation.ts` 用 zod schema(见 `01-conventions.md` § 14.2)
  3. 生产环境 `JWT_SECRET === 'change-me-please'` 直接抛错退出
  4. 创建 `apps/backend/.env.example`,列出所有变量(无敏感值)
  5. 启动 banner:Logger 打印 APP_NAME / APP_ENV / APP_PORT / DATABASE_URL(脱敏后)
- **验收**:
  - [ ] 缺失 DATABASE_URL → 启动失败,日志清晰指出
  - [ ] 生产环境 + 默认 JWT_SECRET → 启动失败
  - [ ] `.env.example` 包含所有变量

### T-007 修复 TransformInterceptor 对文件流/SSE 的误包装

- **类型**: fix
- **上下文**: `Content-Disposition: attachment` / `text/event-stream` 也会被包成 ApiResponse,破坏下载与 SSE
- **涉及文件**: `apps/backend/src/common/interceptors/transform.interceptor.ts`
- **实施要点**:
  1. 检查响应对象的 `Content-Type` / `Content-Disposition`,命中则直接 `next.handle()` 不包装
  2. 路径白名单:`/api-docs`、`/doc.html`、`/health`、以 `/file/` 开头的、`/api/*/export`、`/api/*/download`
  3. 用装饰器 `@SkipTransform()` 显式跳过(`SetMetadata('skipTransform', true)`)
  4. Health 接口加 `@SkipTransform()`,仅返回 `{ status: 'ok', uptime: ... }`
- **验收**:
  - [ ] e2e:导出 xlsx → 响应头正确,前端能直接下载
  - [ ] e2e:`/api/health` 不被包装

### T-008 main.ts 启动加固

- **类型**: feat
- **上下文**: 缺 helmet、compression、graceful shutdown
- **涉及文件**: `apps/backend/src/main.ts`
- **实施要点**:
  ```ts
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));                   // pino logger
  app.use(helmet());
  app.use(compression());
  app.enableCors({ origin: env.CORS_ORIGIN.split(','), credentials: true });
  app.setGlobalPrefix('api', { exclude: ['/health', '/file/(.*)'] });
  app.useGlobalPipes(new ValidationPipe({
    transform: true, whitelist: true, forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useStaticAssets(join(__dirname, '..', env.UPLOAD_DIR), { prefix: '/file/' });
  app.enableShutdownHooks();
  await app.listen(env.APP_PORT);
  ```
- **验收**:
  - [ ] 响应头含 helmet 默认头(X-Content-Type-Options 等)
  - [ ] 大于 1KB 的 JSON 响应有 Content-Encoding: gzip
  - [ ] kill -SIGTERM 后 Nest 优雅退出(打印 `Closing signal SIGTERM`)
  - [ ] CORS 跨域生效
- **已知坑**: 静态文件 `/file/` 与 file controller 路径冲突 → 静态目录前缀挂在 setGlobalPrefix exclude,且 file controller 路径必须是 `/api/file/` 而非 `/file/`

### T-009 接入 nestjs-pino 结构化日志

- **类型**: feat
- **上下文**: 当前用原生 NestJS Logger,无结构化、无 traceId
- **涉及文件**:
  - `apps/backend/src/app.module.ts`
  - `apps/backend/src/common/middleware/request-context.middleware.ts`(新建)
- **实施要点**:
  1. `LoggerModule.forRoot`:
     ```ts
     LoggerModule.forRoot({
       pinoHttp: {
         level: env.LOG_LEVEL,
         transport: env.APP_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
         genReqId: (req) => req.headers['x-request-id'] ?? nanoid(),
         autoLogging: { ignore: (req) => req.url.startsWith('/health') || req.url.startsWith('/api-docs') },
         customProps: (req) => ({ traceId: req.id }),
         redact: ['req.headers.authorization', 'req.body.password', 'req.body.oldPassword', 'req.body.newPassword'],
       },
     })
     ```
  2. 每个请求把 `traceId` 通过 ALS 注入 `RequestContext`,Prisma 中间件、OperLogInterceptor 共用
- **验收**:
  - [ ] 开发环境:控制台彩色 pretty 输出
  - [ ] 生产环境:JSON 单行输出,含 traceId
  - [ ] 敏感字段被 redact 为 `[Redacted]`
  - [ ] 同一请求所有日志的 traceId 一致

### T-010 Throttler 路由级配置(登录/验证码限流加严)

- **类型**: feat
- **上下文**: 全局 60s/60 次,登录接口缺乏暴力破解防护
- **涉及文件**:
  - `apps/backend/src/auth/auth.controller.ts`
  - `apps/backend/src/app.module.ts`
- **实施要点**:
  1. 全局保留 60s/60(default)
  2. 登录接口加 `@Throttle({ default: { limit: 5, ttl: 60_000 } })`
  3. 验证码接口加 `@Throttle({ default: { limit: 10, ttl: 60_000 } })`
  4. ThrottlerStorage 改用 Redis(`@nest-lab/throttler-storage-redis`),多实例共享计数
- **验收**:
  - [ ] 1 分钟内 6 次登录失败请求 → 第 6 次 429
  - [ ] 重启 backend,Redis 中限流计数仍存在

### T-011 Health 端点

- **类型**: feat
- **涉及文件**: `apps/backend/src/health/health.controller.ts`,`health.module.ts`
- **实施要点**:
  - GET `/health`:返回 `{ status, uptime, timestamp, db, redis }`,db/redis 用 `prisma.$queryRaw\`SELECT 1\`` / `redis.ping()` 探活
  - 失败时 status code 503
  - `@Public()` + `@SkipTransform()`
- **验收**:
  - [ ] 正常 → 200,JSON 含 db: ok / redis: ok
  - [ ] 停掉 Redis → 503

---

## S1 基础设施(workspace、Docker、winston→pino、健康检查)

S1 大部分卡片在 `06-infra.md` 详细展开(用 T-100 ~ T-119 编号);本文档后端相关 S1 卡使用 **T-130 ~ T-139** 区段以避免与 infra 撞号。

### T-130 RequestContext (AsyncLocalStorage) 落地

- **类型**: feat
- **上下文**: 多租户中间件、OperLog、Logger 均需统一上下文
- **涉及文件**: `apps/backend/src/common/context/request-context.ts`,`request-context.middleware.ts`
- **实施要点**:
  ```ts
  export interface RequestContext {
    user: RequestUser | null;
    traceId: string;
    ip: string;
    userAgent: string;
    tenantId: bigint | null;
  }
  export const requestContext = new AsyncLocalStorage<RequestContext>();
  ```
  在 JwtAuthGuard 解出 user 后立即:
  ```ts
  await requestContext.run(ctx, () => super.canActivate(context));
  ```
  对 Public 路由也注入(user=null,但 traceId/ip 必须有)。
- **验收**:
  - [ ] 单测:嵌套 async 调用中 `requestContext.getStore()` 始终拿到正确值
  - [ ] PrismaService 中能拿到 user.tenantId

### T-131 Health 接入数据库与 Redis 探活(增强 T-011)

- 同 T-011,这里只是迭代:把 db/redis 的探活封装成 `HealthService.check()`,产出 `{ ok: boolean, latencyMs: number, error?: string }`

### T-132 Swagger 配置加固

- **类型**: feat
- **涉及文件**: `apps/backend/src/main.ts`
- **实施要点**:
  1. 仅 `SWAGGER_ENABLED=true` 时挂载
  2. Bearer Token 自动注入 + persistAuthorization
  3. 标签按模块分组(auth / system / monitor / job / gen / file / tenant)
  4. 操作摘要必须 i18n 友好(中文)
- **验收**:
  - [ ] /api-docs 与 /doc.html 双地址可访问
  - [ ] 生产环境 SWAGGER_ENABLED=false 时 404

### T-133 删除 nodemailer 死依赖,删除 @nestjs/schedule(待 S7 重新引入)

- **类型**: chore
- **实施要点**:
  - 当前 ScheduleModule.forRoot() 已注册但无 job,删除注册;待 S7 任务时重新挂
  - 删 nodemailer
- **验收**: `pnpm install` 后 deps 中无这两个包

---

## S2 数据模型(配合 02 文档)

S2 卡片完整列表在 `02-data-model.md` § 12,本节仅记 service 层适配:

### T-220 改造所有 service 的字段名(createTime→createdAt 等)

- **类型**: refactor
- **涉及文件**: `apps/backend/src/modules/system/**/*.service.ts`、`apps/backend/src/modules/monitor/**/*.service.ts`、`apps/backend/src/modules/file/file.service.ts`、`apps/backend/src/auth/auth.service.ts`
- **实施要点**:
  - 全代码 Search & Replace:
    - `createTime` → `createdAt`
    - `updateTime` → `updatedAt`
    - `deleteTime` → `deletedAt`
    - `isDelete: 0` 形式查询 → `deletedAt: null`
    - `isDelete: 1` → `deletedAt: { not: null }`
  - SysRole/User/Post 的 `menuIds`/`postIds`/`deptIds` 字符串读写,改为读写中间表(下张卡)
- **验收**:
  - [ ] grep `createTime|updateTime|deleteTime|isDelete` 在 src 命中 0
  - [ ] 所有 list 接口默认排除已软删

### T-221 改造 Role/User 的角色/岗位/菜单/部门关联读写

- **类型**: refactor
- **涉及文件**:
  - `user.service.ts`(用户的角色/岗位)
  - `role.service.ts`(角色的菜单/数据范围部门)
- **实施要点**:
  1. 创建用户:`prisma.sysUser.create({ data: { ..., userRoles: { create: roleIds.map(id => ({ roleId: id })) }, userPosts: ... }})`
  2. 更新用户:先 deleteMany 中间表 → createMany 新关系(在事务中)
  3. 角色分配菜单:`assignMenus(roleId, menuIds)` 用 transaction
  4. 角色 dataScope=Custom 时同步写 `sysRoleDept`
  5. 查询用户详情时 include userRoles/userPosts,聚合 roleIds/postIds 返回
- **验收**:
  - [ ] e2e:创建用户带 2 角色 2 岗位 → 中间表正确写入
  - [ ] e2e:更新用户角色 → 老关系被删,新关系建立
  - [ ] e2e:查询用户详情 → roleIds/postIds 数组正确

### T-222 PrismaService 注入租户中间件骨架(空逻辑,S3 启用)

- **类型**: feat
- **涉及文件**: `apps/backend/src/common/prisma/prisma.service.ts`,`tenant.middleware.ts`
- **实施要点**:
  - 中间件位置定好,逻辑先 NOOP(直接 next),仅日志记录命中模型,便于 S3 校验白名单是否完整
- **验收**: 启动后 list 一遍数据,日志中能看到中间件被命中的 model 集合

---

## S3 RBAC + 多租户 + dataScope

### T-300 RequestUser 与 JwtStrategy 重构

- **类型**: refactor
- **涉及文件**: `apps/backend/src/auth/jwt.strategy.ts`、`apps/backend/src/common/types/request-user.ts`
- **实施要点**:
  1. JWT payload 仅含 `{ sub: userId, tenantId, jti }`(jti 用于撤销)
  2. JwtStrategy.validate 中:
     - 用 `prisma.sysUser.findFirst({ where: { id: sub, deletedAt: null } })` 加载用户
     - **关键**:JwtStrategy 在请求入口最早执行,此时 `requestContext` 尚未填充 user(中间件会因 `ctx?.user` 为空而 next 透传),因此 JwtStrategy 内的 Prisma 调用**天然不被租户中间件拦截**,无需特殊绕过
     - load 用户的 roles → 聚合 dataScope(取最宽)、roleIds、roleCodes
     - load roles 关联的 menus → 聚合 perms
     - 平台超管:`isPlatformAdmin === 1` 或拥有 `platform_admin` 角色码,permissions 注入 `'*:*:*'`
     - cache 进 Redis(key `auth:user:{userId}`,TTL 5 分钟),`/api/auth/getUserInfo` 与 `JwtStrategy.validate` 共用
  3. 注入 `req.user` 为完整 `RequestUser`
- **验收**:
  - [ ] 单测:多角色取最宽 dataScope
  - [ ] e2e:platform_admin 的 permissions 含 `*:*:*`
  - [ ] e2e:用户被禁用后 5 分钟内仍能访问(缓存命中)— 默认行为,接受;紧急吊销见 T-307

### T-301 `Roles` / `RequirePerm` 装饰器与 Guard 落地

- **类型**: feat
- **涉及文件**:
  - `apps/backend/src/common/decorators/{roles,require-perm}.decorator.ts`
  - `apps/backend/src/common/guards/{roles,permission}.guard.ts`
- **实施要点**:
  ```ts
  // require-perm.decorator.ts
  export type PermMode = 'any' | 'all';
  export const REQUIRE_PERM_KEY = 'requirePerm';
  export const RequirePerm = (
    perms: string | string[],
    mode: PermMode = 'any',
  ) => SetMetadata(REQUIRE_PERM_KEY, { perms: ([] as string[]).concat(perms), mode });

  // permission.guard.ts
  canActivate(ctx: ExecutionContext): boolean {
    const meta = this.reflector.getAllAndOverride<{ perms: string[]; mode: PermMode }>(
      REQUIRE_PERM_KEY, [ctx.getHandler(), ctx.getClass()],
    );
    if (!meta) return true;
    const user = ctx.switchToHttp().getRequest().user as RequestUser | undefined;
    if (!user) throw new UnauthorizedException();
    if (user.permissions.includes('*:*:*')) return true;
    const has = meta.mode === 'all'
      ? meta.perms.every(p => user.permissions.includes(p))
      : meta.perms.some(p => user.permissions.includes(p));
    if (!has) throw new ForbiddenException('权限不足');
    return true;
  }
  ```
  - AppModule 注册 `APP_GUARD` 顺序:JwtAuthGuard → RolesGuard → PermissionGuard
  - 用 `@RequirePerm('system:user:add')` 替换 controller 中所有手挂的权限码
- **验收**:
  - [ ] e2e:用户无 `system:user:add` perm → POST /api/system/user 返回 403
  - [ ] e2e:platform_admin 任意接口 → 200
  - [ ] 单测:any 与 all 模式分别覆盖

### T-302 全部 controller 加 @RequirePerm

- **类型**: refactor
- **涉及文件**: 所有 controller(约 20 个)
- **实施要点**:
  - 按 02 文档 § 10.6 菜单 perms 表逐一标注
  - 列表用 `:list`,详情用 `:query`,新增 `:add`,修改 `:edit`,删除 `:remove`,导入 `:import`,导出 `:export`,重置密码 `:resetPwd`,分配角色 `:assignRole`,等等
  - 若发现表中缺漏的 perm:
    1. 直接在 02 文档 § 10.6 菜单清单中追加该条
    2. 在 `prisma/seed/menu.ts` 中追加同步项
    3. 用 `pnpm prisma:seed` 重跑(seed 文件应为 upsert,幂等),不需要新建 migrate(菜单是数据,非结构)
- **验收**:
  - [ ] 全 controller grep `@Get|@Post|@Put|@Delete` 与 `@RequirePerm` 一一对应(@Public 例外)
  - [ ] e2e 抽样 10 个 perm,无 perm 用户全 403

### T-303 启用 Prisma 租户中间件

- **类型**: feat
- **涉及文件**: `apps/backend/src/common/prisma/tenant.middleware.ts`,`prisma.service.ts`
- **实施要点**: 完整实现 02 文档 § 6 的中间件逻辑
- **验收**:
  - [ ] e2e:租户 A 用户登录后,list 用户接口只返回租户 A 的数据
  - [ ] e2e:平台超管 list 用户 → 返回所有租户数据(顺便附带 tenantId 字段)
  - [ ] e2e:租户 A 用户尝试 update 租户 B 的用户 → 0 行被更新(Prisma 报 P2025 → 404)
  - [ ] 单测:findUnique → findFirst 兼容
- **已知坑**: Prisma 5 `findUnique` 必须按唯一约束,中间件用 AND 注入会报错 → 改写为 `findFirstOrThrow`/`findFirst`

### T-304 dataScope 装饰器与工具

- **类型**: feat
- **涉及文件**:
  - `apps/backend/src/common/decorators/data-scope.decorator.ts`
  - `apps/backend/src/common/utils/data-scope.util.ts`
- **实施要点**: 按 02 文档 § 7 实现 `buildDataScopeWhere()`
- **验收**:
  - [ ] 单测:5 档分别返回正确 where
  - [ ] 自定义部门档:从 sys_role_dept 读取真实部门 id 列表
  - [ ] 多角色取最宽 dataScope

### T-305 在核心 list service 接入 dataScope

- **类型**: feat
- **涉及文件**:
  - `user.service.ts:findPage`
  - `oper-log.service.ts:findPage`
  - `login-log.service.ts:findPage`
  - `file.service.ts:findPage`
- **实施要点**:
  ```ts
  async findPage(query: UserQueryDto, user: RequestUser) {
    const scopeWhere = await buildDataScopeWhere(user, { deptField: 'deptId', userField: 'id' }, this.prisma);
    const where = { AND: [buildBaseWhere(query), scopeWhere ?? {}] };
    return this.prisma.sysUser.findMany({ where, ... });
  }
  ```
- **验收**:
  - [ ] e2e:dataScope=Self 用户 list user → 只见自己
  - [ ] e2e:dataScope=Dept 用户 list user → 只见同部门
  - [ ] e2e:dataScope=DeptAndChildren → 包含子部门
  - [ ] e2e:dataScope=Custom → 仅自定义部门
  - [ ] e2e:dataScope=All → 全部(在租户内)

### T-306 三层账号体系(平台超管 / 租户管理员 / 租户用户)

- **类型**: feat
- **涉及文件**:
  - `apps/backend/src/modules/system/tenant/`(新建)
  - `auth.controller.ts` 增加 `/auth/switchTenant`(平台超管专用)
- **实施要点**:
  1. `tenant.controller.ts` 完整 CRUD:`@RequirePerm('system:tenant:*')`,**只允许 platform_admin**(再加 `@Roles('platform_admin')`)
  2. `auth.controller.ts /switchTenant` (POST,body `{ tenantId }`):
     - 仅 platform_admin 可调,否则 403
     - 校验目标租户存在且 status=1、未过期
     - **重新签发 JWT**,新 payload 中 `tenantId` 字段为目标租户 id(若 `tenantId=null` 表示回到平台视图)
     - 返回 `{ token, expiresIn }`,前端替换 localStorage 中 token,并立即调用 `/api/auth/getUserInfo` 重新拉数据
     - 旧 token 加入黑名单(配合 T-307)
     - 由于 JWT 携带 tenantId,后续请求经 JwtStrategy 解出后写入 RequestContext,Prisma 中间件依此过滤,**无需 X-Tenant-Id header 或 query**
  3. 租户超额校验:租户 user 数 ≥ maxUsers 时新建失败
  4. 租户停用:tenant.status=0 → 该租户全部用户登录失败,提示"租户已停用"(business code 1101)
  5. 租户过期:expireAt < now → code 1102
- **验收**:
  - [ ] e2e:平台超管创建/编辑/停用租户 OK
  - [ ] e2e:租户管理员调用 tenant CRUD → 403
  - [ ] e2e:租户停用后该租户用户登录 → code 1101
  - [ ] e2e:已达 maxUsers,创建用户 → 400 友好提示

### T-307 Token 黑名单与登出

- **类型**: feat
- **上下文**: 当前登出仅清 Redis 在线集,JWT 仍可用
- **涉及文件**:
  - `apps/backend/src/auth/auth.service.ts`
  - `apps/backend/src/common/guards/jwt-auth.guard.ts`
- **实施要点**:
  1. JWT 增加 `jti`(nanoid)
  2. 登出:`redis.set('auth:revoked:{jti}', '1', 'EX', remainingTtl)`
  3. JwtStrategy.validate:命中黑名单 → 抛 401
  4. 重置密码 / 修改密码 / 强制下线:把该用户所有 jti 拉黑(用 `auth:user:{userId}:tokens` set 维护)
- **验收**:
  - [ ] e2e:登出后再用同 token → 401
  - [ ] e2e:管理员强制下线用户 → 该用户后续请求 401
  - [ ] 内存观察:黑名单 key 在 token 过期后自动清理

### T-308 登录失败次数限制 + 账号锁定

- **类型**: feat
- **涉及文件**: `auth.service.ts`
- **实施要点**:
  - 登录失败:`incr('auth:fail:{tenantId}:{username}')`,首次设 30 分钟 TTL
  - 达到 `sys.account.maxRetryCount`(默认 5)→ 锁定账号,返回 423,key 写入 `auth:lock:{tenantId}:{username}` TTL = `sys.account.lockMinutes`
  - 锁定中再尝试登录 → 423 + 剩余分钟数提示
  - 登录成功 → 清除失败计数与锁
  - 管理员可手动解锁(增加 `/api/system/user/:id/unlock` 接口,perm `system:user:unlock`)
- **验收**:
  - [ ] e2e:5 次错误密码后第 6 次返回 423
  - [ ] e2e:30 分钟内锁未解,第 7 次仍 423
  - [ ] e2e:管理员解锁后立即可登录

### T-309 IP 与 UA 解析(登录日志 / 操作日志)

- **类型**: feat
- **涉及文件**:
  - `apps/backend/src/common/utils/ip.util.ts`(新建)
  - `apps/backend/src/common/utils/ua.util.ts`(用 ua-parser-js)
  - `apps/backend/src/common/interceptors/oper-log.interceptor.ts`
  - `apps/backend/src/auth/auth.service.ts`
- **实施要点**:
  1. IP 解析顺序:`X-Forwarded-For`(取第一个 trust 范围内的)→ `X-Real-IP` → `req.ip`,trustProxy 配置见 main.ts(`app.set('trust proxy', 1)`)
  2. UA 解析:`new UAParser(ua).getResult()` → `{ os: { name + version }, browser: { name + version }, device: { model } }`,转换为字符串字段
  3. IP 归属地:**S3 阶段先留空字段**,T-504 在 S5 用纯离线库补;不要外部 HTTP 调用阻塞
- **验收**:
  - [ ] 单测:多种 UA 字符串解析正确
  - [ ] 单测:X-Forwarded-For "1.1.1.1, 2.2.2.2" 正确取 1.1.1.1
  - [ ] e2e:登录日志的 ip / os / browser 字段非空

### T-310 全局 OperLogInterceptor 重写

- **类型**: refactor
- **涉及文件**: `apps/backend/src/common/interceptors/oper-log.interceptor.ts`,`apps/backend/src/common/decorators/oper-log.decorator.ts`
- **实施要点**:
  1. 装饰器 `@OperLog({ module: '用户', operation: '新增', recordRequest: true, recordResponse: false })`
  2. 装饰器未标注的接口不记录(避免日志爆炸)
  3. 拦截 POST/PUT/DELETE,GET 不记录
  4. 失败请求(抛错)在 catchError 中记录 status=0 + errorMsg
  5. params/body redact:`password / oldPassword / newPassword / token / accessKey*` 替换为 `[Redacted]`
  6. respResult 限制最大 4KB,超长截断
  7. 异步落库:`setImmediate(() => prisma.sysOperLog.create(...))`,**不阻塞响应**
- **验收**:
  - [ ] e2e:新增用户 → operLog 表新增一行,operation="新增"
  - [ ] e2e:删除接口抛错 → operLog status=0 errorMsg 非空
  - [ ] e2e:登录请求 body 中的 password 在日志为 [Redacted]
  - [ ] 性能:接口响应 P99 不因日志写入增加 > 5ms

---

## S4 系统管理完善

### T-400 用户管理:批量删除 + Excel 导入导出 + 重置密码

- **类型**: feat
- **涉及文件**:
  - `user.controller.ts` / `user.service.ts`
  - `apps/backend/src/common/utils/excel.util.ts`(新建,封装 exceljs)
- **实施要点**:
  - DELETE /api/system/user(body `ids: number[]`):事务删除 + 中间表 + 软删
  - GET /api/system/user/template:返回模板 xlsx(含示例行 + 数据校验列)
  - GET /api/system/user/export:支持 query 过滤 + dataScope
  - POST /api/system/user/import:multipart,字段映射,逐行校验 → 返回 `{ success, fail, errors[] }`
  - 重置密码 PUT /api/system/user/:id/password/reset:密码读 SysConfig `sys.user.initPassword`,bcrypt 加密
- **验收**:
  - [ ] e2e:批量删除 10 个用户成功,中间表清空
  - [ ] e2e:导出 100 条用户 → xlsx 行数 + 表头匹配
  - [ ] e2e:导入有错误的 xlsx → 返回错误清单,正确行已入库
- **已知坑**: Excel 字段映射建议用 dto 元数据(Reflect.defineMetadata)注入字段顺序,避免硬编码

### T-401 角色管理完善

- **类型**: feat
- **实施要点**:
  - assignMenus:用 SysRoleMenu 中间表 transaction
  - setDataScope:写 SysRole.dataScope,若 dataScope=Custom 同步写 SysRoleDept
  - dataScope 变更后**清除该角色所有用户的 auth 缓存**(`del 'auth:user:{id}'`)
  - 删除角色:校验是否仍有用户引用,有则 409
- **验收**: e2e 覆盖以上 4 个场景

### T-402 部门管理:树形 + ancestors 自动维护

- **类型**: feat
- **实施要点**:
  - 创建/更新部门时计算 `ancestors`(取 parent.ancestors + ',' + parent.id)
  - 移动部门(改 parentId):递归更新所有子部门 ancestors
  - 删除:不允许有子部门或绑定用户
  - GET /api/system/dept/tree:返回树形 JSON(由 service 拼装,不在前端递归)
- **验收**:
  - [ ] e2e:新增 3 层部门,ancestors 字段正确
  - [ ] e2e:删除有子部门的部门 → 400

### T-403 岗位管理(简单 CRUD,补批量删除)

- **类型**: feat
- **验收**: 标准 CRUD + 批量

### T-404 菜单管理:树形拖拽排序

- **类型**: feat
- **实施要点**:
  - GET /api/system/menu/tree:全量树
  - POST /api/system/menu/sort(body `[{ id, parentId, sort }]`):批量更新位置
  - 删除:有子菜单或被角色引用 → 409
- **验收**: 树形拖拽后保存,刷新后顺序保留

### T-405 字典管理双栏 + 缓存

- **类型**: feat
- **实施要点**:
  - 启动时把所有 status=1 的字典加载进 Redis(`dict:{code}` → JSON.stringify(items))
  - GET /api/system/dict/data/byType/:code 直接读 Redis
  - 写操作(增/改/删字典数据)→ 删除 `dict:{code}` 缓存
  - GET /api/system/dict/refresh:清空所有 dict 缓存
- **验收**: e2e 覆盖缓存命中、修改后失效、refresh

### T-406 系统配置真接入业务读取

- **类型**: feat
- **实施要点**:
  - `apps/backend/src/modules/system/config/config.service.ts:get(key)`:Redis 优先 → DB → cache
  - 业务侧调用 `configService.get('sys.user.initPassword')` 等
  - 写操作 → 清缓存 + 通过 EventEmitter 发 `config.changed` 事件,文件存储模块订阅(下张卡)
- **验收**: 修改 `file.storage` 配置后,无需重启,新上传走新驱动

### T-407 通知公告:发布/撤回 + 状态机

- **类型**: feat
- **实施要点**:
  - status 机器:0 草稿 → 1 已发布(填 publishAt)→ 2 已撤回
  - 已发布通知不可编辑(409)
  - 撤回后允许编辑 → 重新发布(回到 1,publishAt 重置)
- **验收**: 状态机 e2e 全覆盖

### T-408 文件管理 + 文件存储配置

- **类型**: feat
- **涉及文件**:
  - `file.service.ts`、`file-config.service.ts`(可合并到 file.service)
  - `storage/storage-provider.factory.ts`
- **实施要点**:
  - 启动时根据 SysConfig `file.storage` 决定当前 provider
  - 监听 `config.changed` 事件,key 以 `file.` 开头 → 重建 provider
  - 上传:写 `sys_file` 记录(含 tenantId / uploaderId / bizType)
  - 删除:同步删存储(local 删文件 / OSS 调 deleteObject),失败仅记日志,不阻塞 DB 删除
  - 列表:支持 bizType / 上传者 / 时间范围筛选
  - 上传白名单从 SysConfig 读
- **验收**:
  - [ ] e2e:5 个 provider 各自上传成功(本地 + 至少 1 个云存储,云存储测试可用 mock provider 替代)
  - [ ] e2e:配置切换后立即生效

### T-450 SysMessage 模型 + 站内信接口(由 05 T-805 触发)

- **类型**: feat
- **涉及文件**:
  - `apps/backend/prisma/schema.prisma`(追加 SysMessage 模型)
  - `apps/backend/src/modules/system/message/`(新建)
- **实施要点**:
  - 新增 model SysMessage:`id / tenantId / receiverId / type(1站内信/2系统/3公告/4待办) / title / content / refType / refId / readAt / createdAt / deletedAt`
  - 索引 `(tenantId, receiverId, readAt)`、`(tenantId, type, createdAt)`
  - 加 prisma migrate(`add-sys-message`)
  - controller:GET /api/system/message(分页,支持 type / readAt 筛选);GET /:id 自动 markRead;PUT /:id/read;PUT /read-all;DELETE /:id;GET /unread-count
  - 接入 dataScope=Self(强制只看自己消息)
  - 加进 TENANT_AWARE_MODELS
- **验收**:
  - [ ] e2e:用户 A 创建/读消息,用户 B 看不到 A 的
  - [ ] e2e:GET /unread-count 准确

### T-451 SysTodo 用 SysMessage type=4 表达(不新建模型)

- **类型**: feat
- **决策**: 待办与消息共用 SysMessage 表,type=4 表示待办,refType / refId 关联业务实体
- **实施要点**:
  - 在 message.service.ts 提供 `findTodos(userId, status)`、`completeTodo(id)` 便捷方法
  - 待办的 readAt 视为"已处理"语义,新增字段 `completedAt`?
  - **决议**:在 SysMessage 增加 `extra Json?` 字段,存待办额外信息(链接、参数等),完成态用 `readAt is not null`
- **验收**: e2e 覆盖创建待办、完成待办

### T-452 工作台 stats 接口(由 05 T-801、04 T-460 触发)

- **类型**: feat
- **涉及文件**: `apps/backend/src/modules/dashboard/`(新建模块)
- **实施要点**:
  - GET /api/dashboard/overview(对应所有用户,无需特殊 perm,已登录即可):返回
    ```json
    {
      "userCount": 0, "tenantCount": 0, "fileCount": 0,
      "todayLoginCount": 0, "unreadCount": 0,
      "loginTrend": [{ "date":"2026-05-04", "count": 12 }, ...],   // 近 30 天
      "roleDistribution": [{ "name":"管理员", "count": 3 }, ...],
      "recentLogins": [...],     // 最近 10 条
      "recentOpers": [...]
    }
    ```
  - 平台超管看全局,租户用户看本租户范围(中间件天然过滤)
  - 数据聚合用 prisma.$queryRaw 与 groupBy 组合
- **验收**: e2e:不同角色返回的统计数据范围正确

### T-453 公告 banner 接口(由 05 T-801 触发)

- **类型**: feat
- **实施要点**:
  - GET /api/system/notice/banner?limit=3:返回 status=1 已发布的最新 N 条公告(只含 id/title/publishAt,不含 content)
  - 已登录即可访问(@Public 不行,需要 tenant 上下文)
- **验收**: 移动端/Web 端轮播能用

### T-454 SysMessage 推送(可选 P2)

- **类型**: feat
- **决策**: 暂不接入 WebSocket / SSE 实时推送,移动端 / Web 端通过定时轮询 `/unread-count` 实现红点
- **要点**:
  - 在 SysMessage 服务层埋点 `EventEmitter.emit('message.created')`,后续接 SSE / 极光推送时不改业务代码
- **验收**: 事件发出可被监听

---

## S5 监控完善

### T-500 ServerService 真实数据填充

- **类型**: feat
- **涉及文件**: `apps/backend/src/modules/monitor/server/server.service.ts`,`server.controller.ts`
- **实施要点**:
  ```ts
  import * as os from 'node:os';
  import * as si from 'systeminformation';

  async getInfo() {
    const [cpu, mem, disk, currentLoad] = await Promise.all([
      si.cpu(), si.mem(), si.fsSize(), si.currentLoad(),
    ]);
    return {
      app: {
        name: env.APP_NAME, env: env.APP_ENV,
        nodeVersion: process.version, uptime: process.uptime(),
        pid: process.pid, memoryUsage: process.memoryUsage(),
      },
      cpu: { manufacturer: cpu.manufacturer, brand: cpu.brand, cores: cpu.cores, speed: cpu.speed, load: currentLoad.currentLoad },
      memory: { total: mem.total, used: mem.used, free: mem.free, usedPercent: (mem.used/mem.total*100).toFixed(2) },
      disk: disk.map(d => ({ fs: d.fs, type: d.type, size: d.size, used: d.used, usedPercent: (d.use).toFixed(2), mount: d.mount })),
      os: { platform: os.platform(), release: os.release(), arch: os.arch(), hostname: os.hostname() },
    };
  }
  ```
  - 加 `systeminformation` 依赖
  - 接口加 `@RequirePerm('monitor:server:view')`
- **验收**: 前端服务监控页所有字段非空、非 mock

### T-501 在线用户精确管理

- **类型**: feat
- **涉及文件**:
  - `online.service.ts`
  - `auth.service.ts`(登录时写在线信息)
- **实施要点**:
  - Redis 结构:`online:user:{tenantId}:{jti}` → JSON `{ userId, username, ip, location, browser, os, loginAt, expireAt }`,TTL = JWT 过期时间
  - 登录写入,登出删除
  - 列表:`scan match online:user:{tenantId}:*` → mget,直接返回(不用反查 DB)
  - 强制下线:删该 jti + 加黑名单(配合 T-307)
- **验收**:
  - [ ] e2e:登录 3 个用户 → 在线列表 3 条
  - [ ] e2e:其中 1 个 token 过期 → 列表自动减少
  - [ ] e2e:管理员强制下线某用户 → 列表移除 + 该用户后续 401

### T-502 缓存监控权限收紧

- **类型**: feat
- **实施要点**:
  - flushdb 仅 platform_admin 可调用
  - getKeys / scan 限制 pattern,禁止裸 `*`(必须前缀至少 3 字符)
  - getValue 大 value 截断 4KB,超出提示前端
- **验收**: e2e 覆盖以上限制

### T-503 操作日志 / 登录日志清理 + 归档

- **类型**: feat
- **实施要点**:
  - clean(): platform_admin 可清理;按时间区间清理
  - export 接口:导出 xlsx,支持过滤
  - 自动归档(可选 S7 任务):每天凌晨清理 90 天前的登录日志(SysJob 触发)
- **验收**: 标准 CRUD + 时间区间

### T-504 IP 归属地解析(离线库)

- **类型**: feat
- **上下文**: T-309 在 S3 留空了 location 字段,本卡补齐
- **涉及文件**:
  - `apps/backend/src/common/utils/ip.util.ts`(增量补 lookupLocation)
  - 新增依赖:`@types/maxmind` + `maxmind` + 离线库文件 `assets/GeoLite2-City.mmdb`(放 backend src 外的 `assets/` 目录,运行时按 absolute path 读)
- **实施要点**:
  - 启动时一次性 `Reader.open(path)`,内存常驻
  - lookupLocation(ip) → 返回 `"国家 省份 城市"` 字符串(中文优先,fallback 英文)
  - 私有 IP / loopback 返回 "内网"
  - 在 OperLogInterceptor / auth login 写日志前调用,失败回退空字符串
  - 必须 **0 网络调用**,纯离线
- **验收**:
  - [ ] 单测:公网 IP 解析非空、私有 IP 返回 "内网"
  - [ ] e2e:登录日志 location 字段非空

---

## S6 代码生成器(完整重写)

### T-600 整体架构设计

- **类型**: feat
- **涉及文件**: `apps/backend/src/modules/gen/`
- **实施要点(架构)**:
  ```text
  modules/gen/
  ├── gen.controller.ts
  ├── gen.service.ts             # 主流程:导入表 → 配置字段 → 预览 → 生成
  ├── gen.module.ts
  ├── dto/
  │   ├── import-table.dto.ts
  │   ├── update-table.dto.ts
  │   ├── update-field.dto.ts
  │   └── gen-query.dto.ts
  ├── templates/                 # Handlebars 模板
  │   ├── backend/
  │   │   ├── controller.hbs
  │   │   ├── service.hbs
  │   │   ├── module.hbs
  │   │   ├── dto.create.hbs
  │   │   ├── dto.update.hbs
  │   │   ├── dto.query.hbs
  │   │   └── prisma.model.hbs
  │   ├── fronted/
  │   │   ├── api.hbs
  │   │   ├── view.list.hbs
  │   │   ├── view.form.hbs
  │   │   └── i18n.hbs
  │   └── sql/
  │       └── menu.hbs
  └── helpers/
      ├── information-schema.ts  # 读 MySQL 元数据
      ├── ts-type.mapper.ts      # SQL 类型 → TS 类型
      ├── handlebars.helpers.ts  # camelCase / pascalCase / kebabCase / pluralize 等
      └── archiver.ts            # zip 打包
  ```
- **验收**: 目录创建,所有占位文件就位

### T-601 information_schema 读取真实表结构

- **类型**: feat
- **涉及文件**: `helpers/information-schema.ts`
- **实施要点**:
  ```ts
  async function listTables(prisma: PrismaService, schema: string) {
    return prisma.$queryRaw<{ TABLE_NAME: string; TABLE_COMMENT: string }[]>`
      SELECT TABLE_NAME, TABLE_COMMENT
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ${schema}
        AND TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME NOT LIKE '\\_prisma\\_%' ESCAPE '\\\\'
    `;
  }
  async function listColumns(prisma: PrismaService, schema: string, table: string) {
    return prisma.$queryRaw<...>`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA, COLUMN_COMMENT, ORDINAL_POSITION
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ${schema} AND TABLE_NAME = ${table}
      ORDER BY ORDINAL_POSITION
    `;
  }
  ```
  - schema 取 `DATABASE_URL` 解析或从 env 单独读 `GEN_DB_SCHEMA`
  - 排除 `_prisma_migrations` / `gen_*` / `sys_*` 系统表(白名单可配)
- **验收**:
  - [ ] e2e:GET /api/gen/db/tables 返回非系统业务表
  - [ ] e2e:GET /api/gen/db/tables/:name/columns 返回完整字段元数据

### T-602 导入表配置

- **类型**: feat
- **实施要点**:
  - POST /api/gen/import-tables(body `{ tables: string[] }`)
  - 逐表读 columns → 自动生成默认 GenTable + GenTableField
  - className: PascalCase(去前缀如 `biz_` 后转换)
  - businessName: camelCase(同上)
  - moduleName: 默认 `biz`,可在表配置编辑时改
  - 字段默认值:`is_pk` 自动识别(COLUMN_KEY=PRI),`is_required` = NOT NULL,`tsType` 通过 mapper 推断
- **验收**:
  - [ ] e2e:导入业务表 → GenTable + GenTableField 落库,字段顺序正确
  - [ ] e2e:重复导入同一表 → 409

### T-603 Handlebars 模板与 helpers

- **类型**: feat
- **涉及文件**: `helpers/handlebars.helpers.ts`,`templates/**/*.hbs`
- **实施要点**:
  - 注册 helpers:`pascalCase / camelCase / kebabCase / snakeCase / pluralize / singularize / eq / contains / json`
  - 模板示例(controller.hbs 节选):
    ```handlebars
    @Controller('{{moduleName}}/{{kebabCase businessName}}')
    @ApiTags('{{functionName}}')
    export class {{className}}Controller {
      constructor(private readonly service: {{className}}Service) {}

      @Get()
      @RequirePerm('{{moduleName}}:{{businessName}}:list')
      findPage(@Query() query: {{className}}QueryDto, @CurrentUser() user: RequestUser) {
        return this.service.findPage(query, user);
      }
      ...
    }
    ```
  - 所有模板必须使用项目实际命名规范(`@RequirePerm` 而非 `@PreAuthorize` 等)
- **验收**: 单测渲染一个示例表 → 产物字符串与期望快照一致

### T-604 预览 + 下载 zip

- **类型**: feat
- **实施要点**:
  - GET /api/gen/preview/:tableId:返回 `{ [filePath: string]: string }`,前端用代码 viewer 显示
  - GET /api/gen/download/:tableId:用 archiver 打包 zip,Content-Type: application/zip,Content-Disposition: attachment
  - GET /api/gen/download/batch?ids=1,2,3:多表合并 zip
  - 文件路径示例(zip 内):
    ```text
    apps/backend/src/modules/biz/order/order.controller.ts
    apps/backend/src/modules/biz/order/order.service.ts
    apps/backend/src/modules/biz/order/order.module.ts
    apps/backend/src/modules/biz/order/dto/...
    apps/fronted/src/api/biz/order.ts
    apps/fronted/src/views/biz/order/index.vue
    apps/fronted/src/views/biz/order/components/OrderForm.vue
    apps/fronted/src/i18n/zh-CN/biz.order.ts
    apps/fronted/src/i18n/en-US/biz.order.ts
    db/menu.order.sql
    ```
- **验收**:
  - [ ] e2e:预览返回 Map,文件数 ≥ 9
  - [ ] e2e:下载 zip,解压结构与上表一致

### T-605 同步表结构(syncDb)

- **类型**: feat
- **实施要点**:
  - PUT /api/gen/sync/:tableId:重新读 information_schema,与 GenTableField 比对,新增/修改/删除字段
  - 已配置过的字段保留 `htmlType / queryType / dictType / sort / isList / isQuery` 等用户配置,不覆盖
- **验收**: 改库表加字段后 syncDb,GenTableField 出现新字段且保留旧用户配置

### T-606 生成菜单 SQL

- **类型**: feat
- **实施要点**:
  - `templates/sql/menu.hbs` 输出 INSERT 语句:模块菜单 + list/query/add/edit/remove 5 个按钮
  - 也可直接写库:POST /api/gen/insert-menu/:tableId,要求 platform_admin
- **验收**: 生成的 SQL 在测试库可直接执行

---

## S7 定时任务

### T-700 重新引入 @nestjs/schedule + Job 模型校验

- **类型**: feat
- **涉及文件**: `apps/backend/src/modules/job/`,`app.module.ts`
- **实施要点**:
  - 引入 `@nestjs/schedule@^4.1.0`、`cron@^3.1.7`、`cron-parser@^4.9.0`
  - JobModule + JobService + JobController + JobScheduler
- **验收**: 启动后无报错,JobScheduler 单例存在

### T-701 cron 表达式校验与下次触发时间

- **类型**: feat
- **涉及文件**: `apps/backend/src/common/utils/cron.util.ts`
- **实施要点**:
  ```ts
  import parser from 'cron-parser';
  export function validateCron(expr: string): { valid: boolean; nextDates?: Date[]; error?: string } {
    try {
      const it = parser.parseExpression(expr);
      const dates: Date[] = [];
      for (let i = 0; i < 5; i++) dates.push(it.next().toDate());
      return { valid: true, nextDates: dates };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }
  ```
  - 项目统一使用 5 段 cron(分 时 日 月 周),不支持 6 段秒级
  - JobController POST /api/monitor/job 创建前必须 validateCron
  - GET /api/monitor/job/cron/preview?expr=`*/5 * * * *` 返回未来 5 次触发时间
- **验收**:
  - [ ] e2e:非法 cron 创建 → 400
  - [ ] e2e:preview 返回 5 个未来时间

### T-702 invokeTarget 解析与 handler 注册中心

- **类型**: feat
- **涉及文件**:
  - `apps/backend/src/modules/job/job.scheduler.ts`
  - `apps/backend/src/modules/job/handlers/`(各业务 handler)
  - `apps/backend/src/modules/job/handlers/handler.registry.ts`
- **实施要点**:
  - **invokeTarget 语法**:`beanName.method` 或 `beanName.method('arg1', 2, true)`,**严格不允许动态 eval**
  - 注册中心:启动时扫描所有 `@JobHandler('beanName')` 装饰的 service,挂入 Map<string, instance>
  - 解析:用正则提取 beanName/method/args(支持字符串、整数、布尔三种字面量),不支持复杂对象
  ```ts
  const RE = /^([\w.-]+)\.([\w]+)(?:\(([^)]*)\))?$/;
  function parseInvokeTarget(target: string) {
    const m = RE.exec(target.trim());
    if (!m) throw new BadRequestException('invokeTarget 语法错误');
    const [, bean, method, argStr] = m;
    const args = argStr ? parseLiteralArgs(argStr) : [];
    return { bean, method, args };
  }
  function parseLiteralArgs(s: string): unknown[] {
    // 仅支持 'string' "string" 1 1.2 true false null,逗号分隔
    return JSON.parse('[' + s.replace(/'/g, '"') + ']');
  }
  ```
  - 提供示例 handler:
    ```ts
    @Injectable()
    @JobHandler('demoJob')
    export class DemoJobHandler {
      sayHello(name: string) { console.log(`hello ${name}`); }
      cleanLogs(days: number) { /* delete logs older than days */ }
    }
    ```
- **验收**:
  - [ ] 单测:`parseInvokeTarget('demoJob.sayHello("world")')` 解析正确
  - [ ] 单测:不存在的 bean → BadRequestException
  - [ ] e2e:创建 job → 触发 → demo handler 控制台输出

### T-703 动态调度核心:启停 / 暂停 / 恢复 / 手动触发 / misfire

- **类型**: feat
- **涉及文件**: `apps/backend/src/modules/job/job.scheduler.ts`
- **实施要点**:
  ```ts
  @Injectable()
  export class JobScheduler implements OnModuleInit, OnModuleDestroy {
    constructor(
      private readonly schedulerRegistry: SchedulerRegistry,
      private readonly registry: JobHandlerRegistry,
      private readonly prisma: PrismaService,
      private readonly logger: PinoLogger,
    ) {}

    async onModuleInit() {
      // 启动时加载所有 status=1 的 job,创建 CronJob 实例
      const jobs = await this.prisma.sysJob.findMany({ where: { status: 1, deletedAt: null } });
      for (const j of jobs) await this.schedule(j);
    }

    async schedule(job: SysJob) {
      const key = this.key(job);
      if (this.schedulerRegistry.doesExist('cron', key)) {
        this.schedulerRegistry.deleteCronJob(key);
      }
      const cronJob = new CronJob(job.cronExpression, () => this.runOnce(job));
      this.schedulerRegistry.addCronJob(key, cronJob);
      cronJob.start();
    }

    async pause(jobId: bigint) { /* deleteCronJob + 更新 status=0 */ }
    async resume(jobId: bigint) { /* schedule + status=1 */ }
    async dispatch(jobId: bigint) { /* 立即 runOnce,不动调度 */ }

    private async runOnce(job: SysJob) {
      const start = Date.now();
      const log = await this.prisma.sysJobLog.create({ data: { jobId: job.id, jobName: job.name, invokeTarget: job.invokeTarget, tenantId: job.tenantId, status: 1, startedAt: new Date() } });
      try {
        if (!job.concurrent) {
          // 加 Redis 锁:setnx job:lock:{id} 1 EX 3600
          // 抢不到锁 + misfirePolicy 处理
        }
        const { bean, method, args } = parseInvokeTarget(job.invokeTarget);
        const inst = this.registry.get(bean);
        await inst[method](...args);
        await this.prisma.sysJobLog.update({ where: { id: log.id }, data: { status: 1, finishedAt: new Date(), duration: Date.now() - start } });
      } catch (e) {
        await this.prisma.sysJobLog.update({ where: { id: log.id }, data: { status: 0, errorMsg: (e as Error).stack ?? (e as Error).message, finishedAt: new Date(), duration: Date.now() - start } });
        this.logger.error({ jobId: job.id }, 'Job failed');
      }
      await this.prisma.sysJob.update({ where: { id: job.id }, data: { prevFireAt: new Date(), nextFireAt: parseExpression(job.cronExpression).next().toDate() } });
    }
  }
  ```
  - **misfire 策略**:并发禁止 + 抢锁失败时,按 `misfirePolicy` 处理:1 立即排队下次重试 / 2 仅本次跳过 / 3 标记为失败日志后跳过
  - 单实例分布式锁见 T-704
- **验收**:
  - [ ] e2e:创建 `* * * * *` job → 1-2 分钟内 sys_job_log 出现 ≥ 1 条
  - [ ] e2e:暂停后等 2 分钟 → 无新日志
  - [ ] e2e:恢复 → 立即下次触发
  - [ ] e2e:dispatch 立即触发 → 日志 +1

### T-704 多实例下的 job 去重(Redis 分布式锁)

- **类型**: feat
- **实施要点**:
  - 每个 job 触发前 `SET nap:job:lock:{id} {hostname}:{pid} NX EX <duration+5s>`,失败则跳过
  - 完成后 DEL
  - 如果开启 `concurrent=1`,跳过加锁
- **验收**:
  - [ ] 启动两个 backend 实例,每分钟 job 仅触发一次

### T-705 任务管理 controller(完整 CRUD + 操作)

- **类型**: feat
- **路径**:
  - GET    /api/monitor/job
  - GET    /api/monitor/job/:id
  - POST   /api/monitor/job
  - PUT    /api/monitor/job/:id
  - DELETE /api/monitor/job(批量)
  - PUT    /api/monitor/job/:id/run                  # 手动触发
  - PUT    /api/monitor/job/:id/pause
  - PUT    /api/monitor/job/:id/resume
  - GET    /api/monitor/job/log
  - GET    /api/monitor/job/log/:id
  - DELETE /api/monitor/job/log
- **验收**: e2e 覆盖全部接口

### T-706 默认 demo handler

- **类型**: feat
- **实施要点**: 提供至少 2 个示例 handler,seed 时插入 2 条 status=0 的 job 模板:
  - `demoJob.sayHello('world')` 每分钟
  - `cleanJob.cleanLoginLog(90)` 每天凌晨 3 点
- **验收**: seed 后任务列表有这 2 条,默认暂停状态

---

## 全部后端任务卡总数

| Stage | 卡 ID 区段 | 卡数 | 累计 |
| --- | --- | --- | --- |
| S0 | T-001 ~ T-011 | 11 | 11 |
| S1 | T-130 ~ T-133 | 4  | 15 |
| S2(后端适配) | T-220 ~ T-222 | 3  | 18(配合 02 文档 12 张共 30) |
| S3 | T-300 ~ T-310 | 11 | 29(41) |
| S4 | T-400 ~ T-408 + T-450 ~ T-454 | 14 | 43(55) |
| S5 | T-500 ~ T-504 | 5  | 48(60) |
| S6 | T-600 ~ T-606 | 7  | 55(67) |
| S7 | T-700 ~ T-706 | 7  | 62(74) |

---

完。下一份 `04-fronted.md` 给出 Web 端任务卡。
