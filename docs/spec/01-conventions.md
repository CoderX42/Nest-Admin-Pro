# 01 · 工程规范

> 本文档是 Codex 在本仓库写代码的"宪法"。所有任务卡引用的命名、目录、API 形态、提交规范均以本文为准。
>
> **优先级**:本文 > `00-overview.md` 的高层决策 > 任务卡内的局部说明。任务卡里若与本文冲突,以本文为准并在卡片下方留 issue。

---

## 1. 仓库总体目录

S1 工程化完成后,仓库结构应为:

```text
Nest-Admin-Pro/
├── apps/
│   ├── backend/              # NestJS API
│   ├── fronted/              # Vue 3 Web 后台(目录名拼写错误,保持不动)
│   └── app/                  # UniApp 移动端
├── packages/                 # 跨端共享代码(S1 引入)
│   ├── shared-types/         # 三端共享 TS 类型(响应包装、分页、字典等)
│   └── shared-constants/     # 三端共享常量(perms key、错误码、字典 key 等)
├── docker/                   # Docker 镜像与 compose
│   ├── backend.Dockerfile
│   ├── fronted.Dockerfile
│   ├── nginx.conf
│   └── docker-compose.yml
├── docs/
│   ├── spec/                 # 本目录,Codex 实施蓝图
│   ├── api.md                # 已陈旧,S9 时根据 Swagger 重新生成
│   ├── development.md        # 已陈旧,S9 时重写
│   ├── deployment.md         # 已陈旧,S9 时重写
│   └── faq.md
├── scripts/
│   ├── init-db.sh            # 保留,但内部改为调 prisma migrate
│   ├── seed.sql              # 删除,改为 prisma seed
│   └── README.md
├── .github/workflows/
│   ├── ci.yml                # S9 引入
│   └── deploy.yml            # 可选
├── .editorconfig
├── .gitignore
├── .npmrc                    # auto-install-peers=true 等
├── .nvmrc                    # node 20
├── package.json              # workspace 根
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json        # 三端共享 TS 配置基类
├── README.md
└── LICENSE
```

---

## 2. Node / 包管理

- **Node**:固定 20.x LTS。`.nvmrc` 写 `20`,`package.json` 加 `"engines": { "node": ">=20.10", "pnpm": ">=9" }`
- **包管理**:pnpm 9.x,workspace mode
- **pnpm-workspace.yaml**:

  ```yaml
  packages:
    - apps/*
    - packages/*
  ```

- **`.npmrc`**:

  ```ini
  auto-install-peers=true
  strict-peer-dependencies=false
  shamefully-hoist=false
  enable-pre-post-scripts=true
  ```

- 仓库根 `package.json` 不直接装业务依赖,只装 dev 工具(`turbo` 可选,S1 不强制):

  ```json
  {
    "name": "nest-admin-pro",
    "private": true,
    "devDependencies": {
      "concurrently": "^8.2.2",
      "@types/node": "^20.11.0"
    }
  }
  ```

---

## 3. TypeScript 风格

### 3.1 共享 tsconfig

仓库根 `tsconfig.base.json`,三端 extend 它:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": false,
    "useUnknownInCatchVariables": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

backend 的 tsconfig override `module: CommonJS` / `moduleResolution: Node10`,保持 NestJS 默认。

### 3.2 风格

- **禁用 `any`**:用 `unknown` + 类型守卫;迁移期可用 `// @ts-expect-error <reason>` 但每条必须带原因
- **禁用 `as any`**:同上
- **DTO/Entity 必有显式类型**:controller 入参出参必须标
- **null vs undefined**:仓内统一用 `null` 表示"显式无值",`undefined` 表示"未传"
- **导入顺序**(eslint-plugin-import 强制):
  1. node 内置
  2. 三方包
  3. `@/` 别名
  4. 相对路径
  5. 类型 import 单独成组(`import type`)

### 3.3 Lint

- 三端统一 `eslint` + `@typescript-eslint` + `prettier`
- backend 加 `eslint-plugin-import`,fronted 加 `eslint-plugin-vue`
- prettier 规则:`singleQuote: true, semi: true, trailingComma: 'all', printWidth: 100`
- 禁用 `no-console` 但 backend 必须用 nest Logger,fronted 必须用统一 `logger.ts` 包装

---

## 4. 命名规范

### 4.1 Prisma model → MySQL 表名

**规则**:Prisma `model` 名保持 `PascalCase`,通过 `@@map("...")` 映射到 `snake_case` 物理表名。

| 类别 | model 名 | 表名前缀 | 示例 |
| --- | --- | --- | --- |
| 系统 | `SysXxx` | `sys_` | `SysUser` → `@@map("sys_user")` |
| 代码生成 | `GenXxx` | `gen_` | `GenTable` → `@@map("gen_table")` |
| 业务 | `Xxx` | 无前缀 | `Order` → `@@map("order")`(若 model 已是 snake-friendly,也可省略 `@@map`,但**强制要求加**以保持一致) |

**字段命名**:Prisma `camelCase` 字段。**当字段名本身已是合法的 MySQL 列名(纯小写、无下划线即可的英文单词)时,允许省略 `@map`**;若 Prisma 字段名是 camelCase 多词组合(如 `createdAt`、`tenantId`、`isExternal`),**必须**加 `@map("snake_case")`。

```prisma
model SysUser {
  id        BigInt    @id @default(autoincrement())
  username  String    @db.VarChar(50)                       // 单词,可省 @map(物理列名同字段名)
  nickname  String    @db.VarChar(50)                       // 同上
  createdAt DateTime  @default(now()) @map("created_at")    // camelCase 必须 @map
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  tenantId  BigInt?   @map("tenant_id")
  isExternal Int      @default(0) @map("is_external")

  @@index([tenantId])
  @@map("sys_user")
}
```

> 这条规则为 02 文档 § 4 的 schema 实际写法做合法化解释:`username/nickname/avatar` 等单词字段无需 `@map`;`createdAt/tenantId/isExternal` 等多词字段必须 `@map`。物理表必须始终加 `@@map`。

**强制公共字段**(所有业务表必须有,系统表按需):

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `BigInt @id @default(autoincrement())` | 主键 |
| `tenantId` | `BigInt?` | 多租户字段,见 ADR-06。`null` 表示平台共享数据 |
| `createdAt` | `DateTime @default(now())` | 创建时间 |
| `updatedAt` | `DateTime @updatedAt` | 更新时间 |
| `deletedAt` | `DateTime?` | 软删,`null` 表示未删 |
| `createdBy` | `BigInt?` | 创建者 user id |
| `updatedBy` | `BigInt?` | 更新者 user id |

> 索引规范:涉及多租户 + 软删的查询场景应建组合索引 `@@index([tenantId, deletedAt])`。

### 4.2 后端命名

- 文件名:`kebab-case.<role>.ts`,role ∈ `controller / service / module / dto / guard / pipe / interceptor / filter / decorator / entity`
  - 示例:`user.controller.ts`、`jwt-auth.guard.ts`、`oper-log.interceptor.ts`
- 类名:`PascalCase`,带角色后缀
  - 示例:`UserController` / `UserService` / `JwtAuthGuard` / `OperLogInterceptor`
- 方法名:`camelCase`,动词开头(`create / find / update / remove / paginate / dispatch`)
- 常量:`SCREAMING_SNAKE_CASE`,集中放 `apps/backend/src/common/constants/*.ts`
- 枚举:`PascalCase` 名 + `PascalCase` 成员,放 `apps/backend/src/common/enums/*.ts`

  ```ts
  export enum DataScope {
    All = 1,
    Dept = 2,
    DeptAndChildren = 3,
    Self = 4,
    Custom = 5,
  }
  ```

- DTO:`<Name>Dto` 后缀;Query 参数 DTO 用 `<Name>QueryDto`;创建/更新区分 `Create<Name>Dto` / `Update<Name>Dto`

### 4.3 Web 端命名

- 文件:页面用 `kebab-case` 目录 + `index.vue`;组件用 `PascalCase.vue`
  - 页面:`apps/fronted/src/views/system/user/index.vue`
  - 公共组件:`apps/fronted/src/components/Pagination/index.vue`
  - 业务组件:`apps/fronted/src/views/system/user/components/UserForm.vue`
- store:`apps/fronted/src/store/modules/<name>.ts`,导出 `useXxxStore`
- API:`apps/fronted/src/api/<module>.ts`,**按模块拆分**(替换现有单文件 `api/index.ts`)
- 路由 name:`PascalCase`,与组件 name 对齐(便于 keep-alive)
- CSS class:Tailwind 优先;自定义 class 用 `kebab-case`;BEM 不强制
- v-perm:见 §7

### 4.4 移动端命名

- 页面:`apps/app/src/pages/<module>/<page>.vue`,文件名 `kebab-case`
- store:`apps/app/src/stores/<name>.ts`
- API:`apps/app/src/api/<module>.ts`

### 4.5 perms key(权限码)

格式:`<module>:<resource>:<action>`,全小写,冒号分隔,3 段固定。

| action | 含义 |
| --- | --- |
| `list` | 查询列表 |
| `query` | 查看详情 |
| `add` | 创建 |
| `edit` | 修改 |
| `remove` | 删除(单条/批量) |
| `import` | 导入 |
| `export` | 导出 |
| `resetPwd` | 重置密码(用户专用) |
| `assign` | 分配(角色分配权限/用户分配角色) |
| `dispatch` | 调度(定时任务专用) |

完整 perms key 清单见 `02-data-model.md` § 种子菜单数据。

---

## 5. 后端目录结构(`apps/backend/src/`)

```text
src/
├── main.ts                           # 启动入口
├── app.module.ts                     # 根模块
├── config/
│   ├── env.config.ts                 # ConfigModule 加载 .env
│   ├── env.validation.ts             # 用 zod 校验 env(S1 引入)
│   └── jwt.config.ts                 # JWT 模块配置 factory
├── common/
│   ├── constants/                    # 全局常量
│   ├── enums/                        # 全局枚举
│   ├── decorators/                   # @Public / @Roles / @RequirePerm / @CurrentUser / @TenantId
│   ├── interceptors/                 # TransformInterceptor / OperLogInterceptor
│   ├── filters/                      # GlobalExceptionFilter
│   ├── guards/                       # JwtAuthGuard / RolesGuard / PermissionGuard / TenantGuard
│   ├── pipes/                        # ParseBigIntPipe / ParseArrayPipe(若需自定义)
│   ├── prisma/                       # PrismaService + 租户中间件
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── tenant.middleware.ts
│   ├── redis/                        # ioredis 封装
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   ├── utils/                        # 工具函数(IP 解析 / UA 解析 / cron 校验等)
│   ├── dto/                          # 通用 DTO(PageQueryDto / IdsDto)
│   └── types/                        # 共享类型(JwtPayload / RequestUser)
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── dto/
├── modules/
│   ├── system/
│   │   ├── user/
│   │   ├── role/
│   │   ├── dept/
│   │   ├── post/
│   │   ├── menu/
│   │   ├── dict/
│   │   ├── config/
│   │   ├── notice/
│   │   ├── tenant/                   # S3 新增
│   │   └── system.module.ts          # 聚合所有 system/* 子模块
│   ├── monitor/
│   │   ├── login-log/
│   │   ├── oper-log/
│   │   ├── online/
│   │   ├── server/
│   │   ├── cache/
│   │   └── monitor.module.ts
│   ├── file/
│   │   ├── file.controller.ts
│   │   ├── file.service.ts
│   │   ├── storage/                  # 5 个 provider + factory
│   │   └── dto/
│   ├── gen/                          # S6 重写
│   │   ├── gen.controller.ts
│   │   ├── gen.service.ts
│   │   ├── templates/                # Handlebars 模板
│   │   └── dto/
│   └── job/                          # S7 新增
│       ├── job.controller.ts
│       ├── job.service.ts
│       ├── job.scheduler.ts          # cron 动态调度核心
│       ├── handlers/                 # invokeTarget 注册表(beanName.method)
│       │   ├── demo.handler.ts
│       │   └── ...
│       └── dto/
└── health/
    └── health.controller.ts          # /health(S1 引入)
```

> 每个 `xxx/` 子目录如果有 controller,**必须**同时有 module 文件并被父级 module imports;S2 之前不允许任何 controller 不属于任何 module(NestJS 会装载失败)。

---

## 6. API 契约

### 6.1 全局前缀与版本

- 全局前缀:`/api`,设置在 `main.ts` 的 `app.setGlobalPrefix('api')`
- **不引入 v1/v2 版本号**(内部系统不需要)
- 静态文件挂在 `/file/<...path>`,与 API 隔离

### 6.2 响应包装

成功响应统一:

```json
{
  "code": 200,
  "data": {},
  "message": "success",
  "timestamp": 1700000000000
}
```

分页响应:

```json
{
  "code": 200,
  "data": {
    "list": [],
    "total": 100,
    "pageNum": 1,
    "pageSize": 10
  },
  "message": "success"
}
```

错误响应:

```json
{
  "code": 401,
  "data": null,
  "message": "Unauthorized",
  "errors": [],
  "timestamp": 1700000000000
}
```

`errors` 用于 ValidationPipe 多字段错误,业务异常该字段为空数组。

**例外**(必须用 `@Res()` 旁路 TransformInterceptor):

- 文件下载/上传响应:`Content-Disposition: attachment` 流
- SSE 推送:`text/event-stream`
- 健康检查 `/health`:返回原始 JSON,不包装(便于 k8s 探针)
- Swagger:`/api-docs`、`/doc.html`

实现:在 `TransformInterceptor` 中检测 `context.switchToHttp().getResponse()` 是否已设置 `Content-Type: text/event-stream` 或 `Content-Disposition`,以及路径是否在 bypass 列表,若是则跳过包装。

### 6.3 错误码

`code` 字段(数值,与 HTTP status code 同步,但允许业务码扩展):

| code | HTTP status | 含义 |
| --- | --- | --- |
| 200 | 200 | 成功 |
| 400 | 400 | 参数错误 / 业务校验失败 |
| 401 | 401 | 未登录 / token 过期 / token 失效 |
| 403 | 403 | 无权限 |
| 404 | 404 | 资源不存在 |
| 409 | 409 | 资源冲突(用户名重复等) |
| 423 | 423 | 账号被锁定 |
| 429 | 429 | 触发限流 |
| 500 | 500 | 服务器内部错误 |
| 1001 | 200 | 验证码错误 |
| 1002 | 200 | 验证码过期 |
| 1003 | 200 | 用户名或密码错误 |
| 1004 | 200 | 账号被禁用 |
| 1005 | 200 | 旧密码错误 |
| 1101 | 200 | 租户已停用 |
| 1102 | 200 | 租户套餐过期 |
| 9001 | 200 | 操作过于频繁(业务级限流) |

**约定**:HTTP 4xx/5xx 与业务 1xxx 区别:

- HTTP 401 表示鉴权失败(应清 token 跳登录)
- 业务 1003 表示登录密码错(留在登录页提示)

前端 `request.ts` 拦截器以此判断:`http status === 401` → 清 token;`code !== 200` → 弹 toast。

### 6.4 RESTful 路径

| 操作 | 方法 | 路径 |
| --- | --- | --- |
| 列表(分页) | GET | `/api/system/user` |
| 详情 | GET | `/api/system/user/:id` |
| 创建 | POST | `/api/system/user` |
| 更新 | PUT | `/api/system/user/:id` |
| 删除 | DELETE | `/api/system/user/:id` |
| 批量删除 | DELETE | `/api/system/user`(body 含 `ids: number[]`) |
| 状态变更 | PUT | `/api/system/user/:id/status` |
| 重置密码 | PUT | `/api/system/user/:id/password/reset` |
| 分配角色 | PUT | `/api/system/user/:id/roles` |
| 导入 | POST | `/api/system/user/import`(multipart/form-data) |
| 导出 | GET | `/api/system/user/export`(返回 xlsx 流) |
| 模板 | GET | `/api/system/user/template`(返回 xlsx 流) |

### 6.5 分页参数

统一使用:

```ts
class PageQueryDto {
  @IsInt() @Min(1) @Type(() => Number) pageNum: number = 1;
  @IsInt() @Min(1) @Max(200) @Type(() => Number) pageSize: number = 10;
  @IsOptional() @IsString() orderBy?: string;       // 字段名
  @IsOptional() @IsIn(['asc', 'desc']) order?: 'asc' | 'desc';
}
```

**严格校验**:`pageSize` 上限 200,防止前端误传 99999 拖垮 DB。

---

## 7. 前端按钮级权限指令 `v-perm`

**指令位置**:`apps/fronted/src/directives/perm.ts`,在 `main.ts` 中 `app.directive('perm', permDirective)` 全局注册。

**用法**:

```vue
<!-- 单个权限 -->
<el-button v-perm="'system:user:add'">新增</el-button>

<!-- 多个权限,任一命中即放行(OR) -->
<el-button v-perm="['system:user:edit', 'system:user:add']">编辑</el-button>

<!-- 必须全部命中(AND),用 .all 修饰符 -->
<el-button v-perm.all="['system:user:edit', 'system:user:remove']">高危操作</el-button>

<!-- 角色级,用 .role 修饰符,值为角色 code -->
<el-button v-perm.role="'admin'">超管功能</el-button>
```

**实现要点**:

1. 从 `userStore.permissions: string[]`(由后端 `/api/auth/getUserInfo` 返回)读取
2. 超管 perms 含 `*:*:*` 通配符,直接放行
3. 不命中 → `el.parentNode?.removeChild(el)`(直接移除节点,而非 hidden,避免被 inspect 绕过)
4. 不要支持表达式参数,只支持 string / string[]
5. SSR 不考虑(本系统纯 SPA)

**对应组合式函数**(供脚本中判断):

```ts
// apps/fronted/src/composables/usePerm.ts
export function hasPerm(key: string | string[], all = false): boolean { ... }
export function hasRole(code: string | string[]): boolean { ... }
```

---

## 8. 多租户与上下文传递

### 8.1 RequestUser 类型

JWT 解出后挂在 `req.user`,统一类型:

```ts
// apps/backend/src/common/types/request-user.ts
export interface RequestUser {
  userId: bigint;
  userName: string;
  tenantId: bigint | null;     // null = 平台超管
  isPlatformAdmin: boolean;     // 是否平台超管(可跨租户)
  deptId: bigint | null;
  roleIds: bigint[];
  roleCodes: string[];
  permissions: string[];
  dataScope: DataScope;         // 当前用户的数据范围(取所有角色中最宽的)
}
```

### 8.2 装饰器

- `@Public()`:跳过 JwtAuthGuard,用于登录/验证码/健康检查
- `@CurrentUser()`:取 `req.user`,参数级注入
- `@TenantId()`:取 `req.user.tenantId`,便于 service 层签名清爽
- `@Roles('admin', 'editor')`:任一命中
- `@RequirePerm('system:user:add')`:配合 PermissionGuard
- `@RequirePerm('system:user:add', 'system:user:edit', { mode: 'all' })`:全部命中
- `@DataScope({ deptAlias: 'd', userAlias: 'u' })`:S3 引入,用于 service 层自动拼 where

### 8.3 多租户中间件(Prisma)

`apps/backend/src/common/prisma/tenant.middleware.ts`:

```ts
// 伪代码
prisma.$use(async (params, next) => {
  const tenantId = AsyncLocalStorage.get('tenantId');
  const isPlatformAdmin = AsyncLocalStorage.get('isPlatformAdmin');

  // 1. 平台超管:不注入 where(可见所有租户)
  // 2. 模型在白名单(SysMenu / SysDictType / SysDictData / SysConfig)中:不注入
  // 3. 其他模型 + 非超管:where 中追加 tenantId
  if (!isPlatformAdmin && TENANT_AWARE_MODELS.has(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'count' || params.action === 'aggregate') {
      params.args.where = { ...params.args.where, tenantId };
    }
    if (params.action === 'create') {
      params.args.data.tenantId = tenantId;
    }
    if (params.action === 'update' || params.action === 'delete' || params.action === 'updateMany' || params.action === 'deleteMany') {
      params.args.where = { ...params.args.where, tenantId };
    }
  }

  return next(params);
});
```

**租户感知模型白名单**(02-data-model.md 中详细定义):

- 隔离:`SysUser` / `SysRole` / `SysDept` / `SysPost` / `SysNotice` / `SysFile` / `SysLoginLog` / `SysOperLog` / `SysJob` / `SysJobLog` / 所有业务表
- 共享(全局):`SysMenu` / `SysDictType` / `SysDictData` / `SysConfig` / `SysTenant` / `GenTable` / `GenTableField`

### 8.4 AsyncLocalStorage 上下文

请求上下文用 Node.js 原生 `AsyncLocalStorage`(NestJS 11 OK),在 `JwtAuthGuard` 解出 user 后塞入,Prisma 中间件、Logger、AuditLog 都从中取。

```ts
// apps/backend/src/common/context/request-context.ts
import { AsyncLocalStorage } from 'node:async_hooks';
export interface RequestContext {
  user: RequestUser | null;
  traceId: string;
  ip: string;
  userAgent: string;
}
export const requestContext = new AsyncLocalStorage<RequestContext>();
```

---

## 9. 提交与分支规范

### 9.1 分支

- `main`:稳定分支,只接受 PR 合入
- `feat/<stage>-<short-desc>`:功能分支,如 `feat/s3-rbac`
- `fix/<short-desc>`:修复分支
- `chore/<short-desc>`:杂项

### 9.2 commit message

格式:

```text
[T-XXX] <type>(<scope>): <subject>

<body>(可选,解释 why)

<footer>(可选,如 BREAKING CHANGE: xxx)
```

- `T-XXX`:任务卡 ID,**强制带**
- type:`feat / fix / refactor / chore / docs / test / perf / style / build / ci`
- scope:`backend` / `fronted` / `app` / `infra` / `docs` / `db`
- subject:祈使句、英文、不超 70 字符

**示例**:

```text
[T-301] feat(backend): enable global JwtAuthGuard with @Public decorator

- register JwtAuthGuard via APP_GUARD in app.module
- read isPublic metadata from reflector and bypass
- remove per-controller @UseGuards(JwtAuthGuard) (kept only on auth controller for /me)
```

### 9.3 PR 规范

- PR 标题与 commit subject 一致
- PR 描述包含:
  - **关联任务卡**:`T-XXX`
  - **变更内容**:bullet 列表
  - **验收 checklist**:从任务卡复制
  - **测试方式**:e2e/手测步骤
  - **风险与回滚**:必填

---

## 10. 测试规范

### 10.1 后端

- 单元测试:`*.spec.ts`,与被测文件同目录
- e2e:`apps/backend/test/<module>.e2e-spec.ts`
- 工具:Jest + supertest,Prisma 用 `nestjs-prisma` 的 mock 或独立测试库
- **测试库策略**:e2e 走真实 MySQL,测试前 `pnpm db:reset` 重置,测试 schema 名 `nest_admin_pro_test`
- 覆盖率门禁:S9 引入,line ≥ 60%、function ≥ 70%(核心 auth/rbac 模块单独 ≥ 85%)

### 10.2 Web

- 单元/组件测试:Vitest + @vue/test-utils
- 测试文件:`apps/fronted/src/**/*.spec.ts`
- E2E(可选,S9 不强制):Playwright

### 10.3 移动端

- 不强制单元测试(S9 仅做 H5 端可启动性 smoke test)

---

## 11. 日志规范

### 11.1 后端日志

- 使用 `nestjs-pino`(性能优于 winston,JSON 输出,k8s 友好)
- 日志级别:`fatal / error / warn / info / debug / trace`
- 生产环境只输出 `info` 及以上;开发环境用 `pino-pretty` 美化
- 必带字段:`time / level / traceId / userId / tenantId / msg`
- **禁止**直接 `console.log`,Codex 须用 `Logger` 或 `pinoLogger`
- HTTP 访问日志:由 `pino-http` 中间件接管,排除 `/health`、静态文件、Swagger UI

### 11.2 前端日志

- 浏览器 console 仅在开发环境输出
- 包装 `apps/fronted/src/utils/logger.ts`:

  ```ts
  const isDev = import.meta.env.DEV;
  export const logger = {
    debug: (...a: unknown[]) => { if (isDev) console.debug(...a); },
    info:  (...a: unknown[]) => { if (isDev) console.info(...a); },
    warn:  (...a: unknown[]) => console.warn(...a),
    error: (...a: unknown[]) => console.error(...a),
  };
  ```

---

## 12. 安全规范

- 密码:bcryptjs,salt rounds 10
- JWT:HS256,secret 从 env 读;**生产环境启动时若 `JWT_SECRET === 'default-secret-change-me'` 直接抛错退出**
- CORS:env 配 `CORS_ORIGIN` 白名单,不裸开 `*`
- helmet:S1 引入
- 限流:`@nestjs/throttler` 全局 60s/60 次,登录/验证码路由单独 `@Throttle({ short: { limit: 5, ttl: 60_000 } })`
- 敏感字段:OperLogInterceptor 必须 redact `password / oldPassword / newPassword / token / accessKeySecret`
- SQL 注入:全部走 Prisma,**禁止字符串拼接 raw SQL**;若必须用 `$queryRaw`,使用 tagged template
- 文件上传:校验扩展名 + magic number 双重;路径穿越校验保留(`local.provider.ts` 已有)
- 软删除:`deletedAt` not null 视为已删,前端默认不返回

---

## 13. 国际化(i18n)

### 13.1 Web 端

- 使用 `vue-i18n@9`
- key 用扁平 `module.page.field` 风格,如 `system.user.create`、`common.confirm`
- 三层目录:`apps/fronted/src/i18n/{zh-CN,en-US}/<module>.ts`,运行时 merge
  - `common.ts` / `auth.ts` / `system.user.ts` / `system.role.ts` / ...
- **禁止**在 `.vue` 模板中硬编码中文(包括按钮文字、占位符、表头、提示语、ElMessage)
- 后端返回的菜单 `name`、字典 `label` 不做翻译,直接显示;若需翻译,字典数据存"译文键"而非中文

### 13.2 移动端

- 同上但简化,`apps/app/src/i18n/{zh-CN,en-US}.ts` 单文件

### 13.3 后端

- 错误消息**默认中文**(本系统主要面向中文使用者),英文支持留作 backlog
- ValidationPipe 错误信息用 `class-validator` 的 `message`,统一中文模板

---

## 14. 环境变量

### 14.1 后端 `.env`

完整变量清单:

```env
# 应用
APP_NAME=Nest-Admin-Pro
APP_PORT=3000
APP_ENV=development               # development / production / test
LOG_LEVEL=info                    # fatal / error / warn / info / debug

# 数据库
DATABASE_URL=mysql://root:password@localhost:3306/nest_admin_pro

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=nap:             # 所有 key 加前缀,便于多项目共享 Redis

# JWT
JWT_SECRET=change-me-please
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=change-me-too
JWT_REFRESH_EXPIRES_IN=30d

# 限流
THROTTLE_TTL=60000
THROTTLE_LIMIT=60

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# 文件
UPLOAD_DIR=./uploads
MAX_IMAGE_SIZE=2097152            # 2MB
MAX_FILE_SIZE=104857600           # 100MB
FILE_STORAGE=local                # local / aliyun-oss / tencent-cos / qiniu-kodo / huawei-obs
FILE_PUBLIC_URL=http://localhost:3000/file

# 云存储(FILE_STORAGE != local 时填)
FILE_CLOUD_REGION=
FILE_CLOUD_BUCKET=
FILE_CLOUD_ACCESS_KEY_ID=
FILE_CLOUD_ACCESS_KEY_SECRET=
FILE_CLOUD_ENDPOINT=
FILE_CLOUD_PREFIX=uploads
FILE_CLOUD_PUBLIC_URL=
FILE_CLOUD_SECURE=true

# 验证码
CAPTCHA_ENABLED=true
CAPTCHA_TTL=120                   # 秒

# 多租户
TENANT_DEFAULT_ID=1               # 平台默认租户
TENANT_PLATFORM_ADMIN_ROLE_CODE=platform_admin

# Swagger
SWAGGER_ENABLED=true              # 生产环境建议关
```

### 14.2 校验

`apps/backend/src/config/env.validation.ts` 用 zod 在启动时校验:

```ts
import { z } from 'zod';
const schema = z.object({
  APP_PORT: z.coerce.number().int().min(1).max(65535),
  APP_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url().startsWith('mysql://'),
  JWT_SECRET: z.string().min(16).refine(
    (v) => !(process.env.APP_ENV === 'production' && v === 'change-me-please'),
    { message: 'JWT_SECRET must be changed in production' }
  ),
  // ...
});
export const envValidate = (raw: Record<string, unknown>) => schema.parse(raw);
```

### 14.3 前端 `.env`

`apps/fronted/.env.development` / `.env.production`:

```env
VITE_API_BASE_URL=/api            # 走 vite 代理,生产环境 Nginx 代理
VITE_FILE_BASE_URL=/file
VITE_APP_TITLE=Nest-Admin-Pro
VITE_DEFAULT_LOCALE=zh-CN
VITE_DEFAULT_THEME=professional
```

### 14.4 移动端 `.env`

H5 / 小程序通过条件编译区分,统一从 `apps/app/src/utils/env.ts` 读:

```ts
// #ifdef H5
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
// #endif

// #ifndef H5
export const BASE_URL = 'https://api.example.com/api';   // 小程序硬编码生产域名
// #endif
```

---

## 15. 依赖版本基线(S0 修复 fronted package.json 的依据)

### 15.1 backend

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@nestjs/schedule": "^4.1.0",
    "@nestjs/throttler": "^6.2.1",
    "@nestjs/config": "^3.3.0",
    "@prisma/client": "^5.22.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcryptjs": "^2.4.3",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "cron": "^3.1.7",
    "cron-parser": "^4.9.0",
    "ioredis": "^5.4.1",
    "ua-parser-js": "^1.0.39",
    "nanoid": "^5.0.7",
    "svg-captcha": "^1.4.0",
    "exceljs": "^4.4.0",
    "handlebars": "^4.7.8",
    "archiver": "^7.0.1",
    "dayjs": "^1.11.13",
    "zod": "^3.23.8",
    "nestjs-pino": "^4.1.0",
    "pino": "^9.5.0",
    "pino-http": "^10.3.0",
    "pino-pretty": "^11.2.2",
    "ali-oss": "^6.21.0",
    "cos-nodejs-sdk-v5": "^2.14.6",
    "qiniu": "^7.13.1",
    "esdk-obs-nodejs": "^3.24.3",
    "helmet": "^8.0.0",
    "compression": "^1.7.5",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "prisma": "^5.22.0",
    "@types/node": "^20.11.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/passport-jwt": "^4.0.1",
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.12",
    "@types/archiver": "^6.0.3",
    "typescript": "^5.4.5",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5",
    "supertest": "^7.0.0",
    "@types/jest": "^29.5.13",
    "@types/supertest": "^6.0.2",
    "eslint": "^9.13.0",
    "@typescript-eslint/eslint-plugin": "^8.11.0",
    "@typescript-eslint/parser": "^8.11.0",
    "prettier": "^3.3.3"
  }
}
```

> **删除**:`nodemailer`(未使用)。如需邮件,S4 单独引入。

### 15.2 fronted

```json
{
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.5",
    "pinia": "^2.2.4",
    "element-plus": "^2.8.6",
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.7.7",
    "echarts": "^5.5.1",
    "vue-echarts": "^7.0.3",
    "vue-i18n": "^9.14.1",
    "@vueuse/core": "^11.1.0",
    "nprogress": "^0.2.0",
    "dayjs": "^1.11.13",
    "lodash-es": "^4.17.21",
    "qs": "^6.13.0",
    "file-saver": "^2.0.5",
    "exceljs": "^4.4.0",
    "vuedraggable": "^4.1.0"
  },
  "devDependencies": {
    "vite": "^5.4.10",
    "@vitejs/plugin-vue": "^5.1.4",
    "@vue/tsconfig": "^0.5.1",
    "vue-tsc": "^2.1.10",
    "typescript": "^5.4.5",
    "tailwindcss": "^3.4.14",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",
    "unplugin-auto-import": "^0.18.4",
    "unplugin-vue-components": "^0.27.4",
    "vite-plugin-svg-icons": "^2.0.1",
    "unocss": "^0.63.6",
    "vitest": "^2.1.4",
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^25.0.1",
    "eslint": "^9.13.0",
    "eslint-plugin-vue": "^9.30.0",
    "prettier": "^3.3.3",
    "@types/lodash-es": "^4.17.12",
    "@types/qs": "^6.9.16",
    "@types/file-saver": "^2.0.7",
    "@types/nprogress": "^0.2.3"
  }
}
```

> **关键变更**:
> - `vue-router 5.x` 不存在,固定到 `4.4.5`
> - `vite 8.x` 不存在,固定到 `5.4.10`
> - `typescript 6.x` 不存在,固定到 `5.4.5`
> - **Tailwind 改用 v3**(v4 与 daisyUI 5 兼容性差,主题系统需求重),稳定优先
> - **删除 `daisyUI`**:6 套主题用纯 CSS 变量自定义,不依赖 daisyUI(见 `07-themes.md`)
> - **新增 echarts / vue-echarts**(图表)、`@vueuse/core`、`nprogress`、`dayjs`、`lodash-es`、`qs`、`file-saver`、`exceljs`(导入导出)、`vuedraggable`(菜单/字段拖拽)

### 15.3 app

```json
{
  "dependencies": {
    "vue": "^3.5.0",
    "pinia": "^2.2.4",
    "@dcloudio/uni-app": "3.0.0-4030620241128001",
    "@dcloudio/uni-h5": "3.0.0-4030620241128001",
    "@dcloudio/uni-mp-weixin": "3.0.0-4030620241128001",
    "dayjs": "^1.11.13"
  },
  "devDependencies": {
    "@dcloudio/types": "^3.4.14",
    "@dcloudio/uni-automator": "3.0.0-4030620241128001",
    "@dcloudio/uni-cli-shared": "3.0.0-4030620241128001",
    "@dcloudio/vite-plugin-uni": "3.0.0-4030620241128001",
    "vite": "^5.4.10",
    "typescript": "^5.4.5",
    "vue-tsc": "^2.1.10",
    "sass": "^1.80.0"
  }
}
```

> **关键变更**:
> - 新增 `pinia`(README 已知问题)、`dayjs`、`sass`
> - 删除 `vue-i18n`(零使用,后续 P2 真要 i18n 再加)
> - DCloud 包版本以官方 `package.json` template 最新稳定版为准,Codex 实施时跑一次 `npx create-uni-app` 拿到对齐版本号

---

## 16. 文档书写规范

- markdown 用 GFM(GitHub Flavored)
- 代码块必须带语言标签
- 引用文件:`apps/backend/src/auth/auth.service.ts:45` 格式,行号可选
- 表格优先;长说明用列表
- 中英文混排时**英文与中文之间不加空格**(本仓库内一致风格)
- 任务卡 ID 在文档内首次出现需可点击(`[T-301](#t-301)`),不强制

---

完。下一份文档 `02-data-model.md` 将给出完整的 Prisma schema 重写、迁移流程与 seed 脚本结构。
