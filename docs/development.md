# 开发指南

## 项目结构

```
Nest-Admin-Pro/
├── apps/
│   ├── backend/       # NestJS 后端
│   │   └── src/
│   │       ├── auth/        # 认证模块
│   │       ├── cache/       # 缓存服务
│   │       ├── common/      # 通用（拦截器、异常、响应）
│   │       ├── config/      # 配置
│   │       ├── file/        # 文件上传
│   │       └── modules/     # 业务模块
│   │           ├── system/   # 系统管理
│   │           ├── monitor/  # 监控管理
│   │           └── gen/      # 代码生成
│   ├── vben-admin/    # Vben Admin 管理后台（pnpm + turbo monorepo）
│   │   ├── apps/
│   │   │   └── web-antd/    # Ant Design Vue 应用入口
│   │   │       └── src/
│   │   │           ├── api/        # 接口封装
│   │   │           ├── router/     # 路由（含动态菜单守卫）
│   │   │           ├── store/      # Pinia 状态
│   │   │           └── views/      # 页面（system/monitor/profile/dashboard）
│   │   ├── packages/             # 共享包：@core / effects / stores / utils / styles ...
│   │   └── internal/             # vite-config / tsconfig / eslint-config ...
│   └── app/           # UniApp 移动端
│       └── src/
│           ├── api/         # 接口
│           ├── pages/       # 页面
│           ├── static/      # 静态资源
│           └── stores/       # 状态管理
├── scripts/           # 脚本
└── docs/              # 文档
```

## 开发规范

### Git 提交规范

```
feat: 新功能
fix: 修复问题
docs: 文档变更
style: 代码格式
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 目录 | 小写、中划线 | `system-user` |
| 文件 | 小写、中划线 | `user-controller.ts` |
| 类名 | 大驼峰 | `UserController` |
| 方法名 | 小驼峰 | `getUserInfo` |
| 变量名 | 小驼峰 / 下划线 | `userName`, `user_name` |
| 常量 | 大写下划线 | `MAX_COUNT` |

### API 设计

- RESTful 风格
- 使用名词复数：`/users`, `/roles`
- 使用 HTTP 方法：`GET`, `POST`, `PUT`, `DELETE`
- 版本号前缀：`/api/v1/users`

### 数据库规范

- 表名：`sys_` 前缀，如 `sys_user`
- 字段：下划线命名，如 `user_name`
- 主键：`id` BigInt 自增
- 时间：`create_time`, `update_time`
- 软删除：`is_delete` (0/1)

## 后端开发

### 模块创建

```bash
# 1. 创建模块目录
mkdir -p src/modules/{module}

# 2. 创建文件
# src/modules/demo/demo.controller.ts
# src/modules/demo/demo.service.ts
# src/modules/demo/demo.module.ts
# src/modules/demo/dto/
# src/modules/demo/entities/

# 3. 注册模块到 app.module.ts
```

### 数据模型

使用 Prisma schema 定义数据模型，参考 `apps/backend/prisma/schema.prisma`

### DTO 设计

```typescript
// 创建 DTO
export class CreateDemoDto {
  name: string;
  status: number;
}

// 更新 DTO
export class UpdateDemoDto extends PartialType(CreateDemoDto) {}
```

### 权限控制

```typescript
// 角色级权限
@RequireRole('admin')

// 按钮级权限
@RequirePermission('system:user:add')
```

## 前端开发（Vben Admin / Ant Design Vue）

Vben Admin 采用 pnpm + turbo monorepo，业务代码集中在 `apps/vben-admin/apps/web-antd` 下，共享组件、工具、store 等位于 `apps/vben-admin/packages/*` 与 `apps/vben-admin/internal/*`。

### 添加一个业务页面

1. 在 `apps/vben-admin/apps/web-antd/src/views/<module>/<page>/index.vue` 创建页面组件
2. （如需菜单）后端菜单管理中维护菜单项，组件路径填 `module/page/index`
3. 页面里通过 `#/api` 下的封装方法调用后端接口

### 主题与偏好

- 主题由 `apps/vben-admin/apps/web-antd/src/preferences.ts` 覆盖默认配置
- 偏好持久化使用 `pinia-plugin-persistedstate` + `@vben/stores`

### 调试

```bash
cd apps/vben-admin
pnpm dev:antd   # 默认监听 http://localhost:5173
```

## 常用命令

```bash
# 后端（apps/backend）
npm run start:dev          # 开发模式
npm run build              # 生产构建
npm run start:prod         # 生产运行
npx prisma generate        # 生成 Prisma Client
npx prisma db push         # 同步表结构

# 前端（apps/vben-admin）
pnpm install               # 首次安装（Vben Admin 自带 monorepo）
pnpm dev:antd              # 开发模式（Ant Design Vue）
pnpm build:antd            # 生产构建

# 移动端（apps/app）
npm run dev:h5             # H5 开发
npm run build:h5           # H5 构建
npm run dev:mp-weixin      # 微信小程序

# 根目录快捷方式
pnpm backend:dev           # 等价于 npm --prefix apps/backend run start:dev
pnpm vben:dev              # 等价于 pnpm --dir apps/vben-admin dev:antd
```

## 环境变量

### 后端 (.env)

```env
# 数据库
DATABASE_URL=mysql://root:password@localhost:3306/nest_admin_pro

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
FILE_STORAGE=local

# 对象存储通用配置（FILE_STORAGE 非 local 时填写）
FILE_CLOUD_REGION=oss-cn-hangzhou
FILE_CLOUD_BUCKET=your-bucket
FILE_CLOUD_ACCESS_KEY_ID=your-access-key-id
FILE_CLOUD_ACCESS_KEY_SECRET=your-access-key-secret
FILE_CLOUD_ENDPOINT=
FILE_CLOUD_PREFIX=uploads
FILE_CLOUD_PUBLIC_URL=https://cdn.example.com
FILE_CLOUD_SECURE=true
```

### 前端 (apps/vben-admin/apps/web-antd/.env.development)

```env
VITE_PORT=5173
VITE_BASE=/
VITE_GLOB_API_URL=/api
VITE_NITRO_MOCK=false
```

## 测试

```bash
# 运行单元测试
pnpm test

# 运行 e2e 测试
pnpm test:e2e

# 生成覆盖率报告
pnpm test:cov
```
