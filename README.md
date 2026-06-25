# Nest-Admin-Pro

Nest-Admin-Pro 是一个基于 NestJS、Prisma、Vben Admin（Vue 3 + Ant Design Vue）和 UniApp 的全栈后台管理系统模板。项目采用多应用目录组织，将后端 API、Web 管理后台和移动端应用放在同一个仓库中，适合作为中小型管理系统、接单项目或二次开发脚手架。

## 功能特性

- **前后端分离**：NestJS 后端 + Vben Admin 管理后台 + UniApp 移动端，三端同仓库维护
- **RBAC 权限控制**：JWT 认证、角色权限、按钮级权限守卫，支持动态菜单渲染
- **系统管理**：用户、角色、部门、岗位、菜单、字典、参数、通知公告
- **系统监控**：登录日志、操作日志、在线用户、服务器信息、Redis 缓存监控
- **代码生成器**：表配置、字段配置、预览生成、接口生成（模板化）
- **文件上传**：图片/文件上传、静态文件访问
- **主题系统**：Vben Admin 偏好系统（主题、布局、动画、tab 风格等），支持偏好持久化
- **国际化**：Web 前端内置 zh-CN / en-US 双语支持
- **移动端**：UniApp 支持 H5 及 13 个小程序平台，含登录、首页、个人中心、资料修改、密码修改
- **开发体验**：Swagger 接口文档、全局参数校验、统一响应格式、全局异常过滤、接口限流

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 后端 | NestJS 11、TypeScript、Prisma 5、MySQL、Redis、JWT、Swagger、class-validator、ioredis、svg-captcha |
| Web 前端 | Vben Admin 5、Ant Design Vue 4、Vue 3、Vite 8、Pinia 3、Vue Router 5、Axios、Turbo、pnpm、ECharts 6、vue-i18n 11、@vueuse/core |
| 移动端 | UniApp 3、Vue 3 |

## 目录结构

```text
Nest-Admin-Pro/
├── apps/
│   ├── backend/          # NestJS 后端 API
│   │   ├── src/
│   │   │   ├── auth/            # 认证模块
│   │   │   ├── cache/           # Redis 缓存服务
│   │   │   ├── common/          # PrismaService 等通用能力
│   │   │   ├── config/          # 环境配置加载
│   │   │   ├── file/            # 文件上传
│   │   │   ├── modules/
│   │   │   │   ├── system/      # 系统管理（user/role/dept/post/menu/dict/config/notice）
│   │   │   │   ├── monitor/     # 系统监控（login-log/oper-log/online/server/cache）
│   │   │   │   └── gen/         # 代码生成器
│   │   │   └── main.ts          # 应用入口
│   │   └── prisma/
│   │       └── schema.prisma    # Prisma 数据模型
│   ├── vben-admin/       # Vben Admin 管理后台（pnpm + turbo monorepo）
│   │   ├── apps/
│   │   │   └── web-antd/        # Ant Design Vue 应用入口
│   │   │       └── src/
│   │   │           ├── api/     # 接口封装（core/monitor/system）
│   │   │           ├── layouts/ # 基础布局、登录布局
│   │   │           ├── locales/ # 国际化
│   │   │           ├── router/  # 路由（含动态菜单守卫）
│   │   │           ├── store/   # Pinia 状态
│   │   │           └── views/   # 页面（system/monitor/profile/dashboard）
│   │   ├── packages/            # 共享包：@core、effects、stores、utils、styles ...
│   │   ├── internal/            # vite-config / tsconfig / eslint-config ...
│   │   └── scripts/             # turbo-run / vsh / deploy
│   └── app/              # UniApp 移动端
│       ├── src/
│       │   ├── api/             # 接口封装
│       │   ├── pages/           # 页面（login/index/center/user）
│       │   ├── stores/          # Pinia 状态管理
│       │   └── utils/           # 请求封装
│       ├── pages.json           # 页面路由与 TabBar
│       └── manifest.json        # 多平台配置
├── scripts/              # 数据库初始化脚本
│   ├── init-db.sh              # 一键初始化脚本
│   └── seed.sql                # 种子数据 SQL
├── docs/                 # 项目文档
├── pnpm-workspace.yaml   # 根 pnpm workspace
├── package.json          # 根快捷命令
└── README.md
```

## 子应用概览

### 后端（`apps/backend`）

- **认证模块**：登录、注册、验证码、登出、获取当前用户信息、修改个人资料、修改密码
- **系统管理**：用户管理、角色管理、部门管理、岗位管理、菜单管理、字典管理、参数管理、通知公告
- **系统监控**：登录日志、操作日志、在线用户、服务监控、缓存监控（Redis 信息/键管理）
- **代码生成**：生成表配置、字段配置、代码预览、生成接口
- **文件管理**：文件上传、图片上传、上传文件访问
- **全局能力**：统一响应格式 `ApiResponse`、全局异常过滤器、ValidationPipe 参数校验、Throttler 限流（60 秒 60 次）、Swagger 文档（Bearer Token 认证）、JWT Guard、RolesGuard、PermissionGuard
- **定时任务**：`SysJob` / `SysJobLog` 模型已定义，`ScheduleModule` 未注册，业务处理器尚未实现

全局 API 前缀为 `/api`，默认端口 `3000`。Swagger 访问地址：`http://localhost:3000/doc.html` 或 `/api-docs`。

### Web 管理后台（`apps/vben-admin`）

基于 [Vben Admin 5](https://github.com/vbenjs/vue-vben-admin) 的 pnpm + turbo monorepo，当前使用 `apps/web-antd`（Ant Design Vue 4 风格）。已实现与本项目后端的对接：

- 动态侧边栏菜单：通过后端 `/auth/user/info` 拉取菜单树，转换为 Vben 路由
- 权限路由守卫：基于 RBAC，按钮级权限码（`perms`）控制
- 偏好系统：主题、布局、动画、Tab 风格、面包屑等通过 `pinia-plugin-persistedstate` 持久化
- 国际化：zh-CN（默认）/ en-US
- ECharts：仪表盘与服务监控图表

**已对接页面**（位于 `apps/vben-admin/apps/web-antd/src/views`）：
- Dashboard：分析页
- 系统管理：用户、部门、岗位、菜单、角色、字典、参数、通知公告
- 系统监控：登录日志、操作日志、在线用户、服务监控、缓存监控
- 个人中心：基础资料、安全设置、消息通知

开发服务器默认端口 `5173`，已配置代理：`/api` 和 `/file` 均转发至 `http://localhost:3000`。

### 移动端（`apps/app`）

当前包含 5 个页面：

- 登录页（含验证码、预填 admin/admin123）
- 首页（TabBar 页面，展示用户信息与快捷操作）
- 个人中心（TabBar 页面，头像上传、跳转资料/密码/退出）
- 个人资料修改
- 修改密码

**特性**：
- JWT Bearer Token 认证，401 自动跳转登录
- 文件上传头像接口封装
- 跨平台支持：H5 + 微信小程序、支付宝小程序、百度小程序、字节跳动小程序等 13 个平台

> 注意：移动端源码中使用了 Pinia，但 `package.json` 中未声明该依赖，实际运行前可能需要手动安装 `pinia`。

## 快速开始

### 环境要求

- Node.js >= 22.18（Vben Admin 5 强制要求；后端与移动端仍可在 18+ 上运行）
- pnpm >= 11（Vben Admin 5 强制要求，后端与移动端使用 npm）
- MySQL
- Redis

### 1. 启动后端

```bash
cd apps/backend
npm install
```

创建或修改 `apps/backend/.env`：

```env
APP_PORT=3000
APP_ENV=dev

DATABASE_URL=mysql://root:password@localhost:3306/nest_admin_pro

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

JWT_SECRET=change-me
JWT_EXPIRES_IN=7d

UPLOAD_DIR=./uploads
MAX_IMAGE_SIZE=2097152
MAX_FILE_SIZE=104857600

# 文件存储：local / aliyun-oss / tencent-cos / qiniu-kodo / huawei-obs，默认 local
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

生成 Prisma Client：

```bash
npx prisma generate
```

首次建库推荐使用 `prisma db push` 或 `scripts/init-db.sh`（详见下方【数据库初始化】）。

启动后端：

```bash
npm run start:dev
```

访问地址：

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api-docs`
- Swagger 备用地址：`http://localhost:3000/doc.html`

### 2. 启动 Web 管理后台

Vben Admin 5 是 pnpm 11+ monorepo，需在 `apps/vben-admin` 子目录独立安装与启动：

```bash
cd apps/vben-admin
corepack enable && corepack prepare pnpm@11.2.2 --activate
pnpm install
pnpm dev:antd
```

访问地址：`http://localhost:5173`

开发服务器已配置代理，`/api` 与 `/file` 会自动转发到 `http://localhost:3000`，无需额外配置。

### 3. 启动移动端

```bash
cd apps/app
npm install
```

H5 开发：

```bash
npm run dev:h5
```

微信小程序开发：

```bash
npm run dev:mp-weixin
```

## 数据库初始化

项目已提供完整的数据库初始化脚本和种子数据，位于 `scripts/` 目录下。

### 方式一：一键初始化脚本（推荐）

`scripts/init-db.sh` 会自动完成：创建数据库、安装依赖、生成 Prisma Client、导入种子数据。

```bash
cd scripts
chmod +x init-db.sh
./init-db.sh
```

支持通过环境变量自定义连接参数：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| DB_HOST | localhost | MySQL 主机 |
| DB_PORT | 3306 | MySQL 端口 |
| DB_USER | root | 用户名 |
| DB_PASSWORD | （空） | 密码 |
| DB_NAME | nest_admin_pro | 数据库名 |

示例：

```bash
DB_HOST=localhost DB_USER=root DB_PASSWORD=123456 ./init-db.sh
```

### 方式二：手动导入 SQL

1. 先同步数据库结构：

```bash
cd apps/backend
npx prisma db push
```

2. 再导入种子数据：

```bash
mysql -u root -p nest_admin_pro < scripts/seed.sql
```

`scripts/seed.sql` 包含以下初始数据：

- 5 个部门（总公司、技术部、产品部、运营部、财务部）
- 10 个岗位（总经理、技术总监、开发工程师、产品经理等）
- 2 个角色（超级管理员、普通角色）
- 2 个用户（admin、user，密码均为 `admin123`，已做 bcrypt 加密）
- 27 条菜单记录（含目录、菜单、按钮级权限标识）
- 4 个字典类型 + 12 条字典数据
- 7 条系统配置（系统名称、Logo、版权、验证码开关等）
- 2 条通知公告
- 1 条默认租户数据

### 方式三：纯 Prisma 迁移

如果不需要种子数据，可直接使用 Prisma 命令同步表结构：

```bash
cd apps/backend
npx prisma db push
```

此方式不会插入任何初始数据，需要自行准备账号、角色和菜单等基础数据。

### 默认账号

```text
用户名：admin
密码：admin123
```

## API 概览

后端全局前缀 `/api`，所有响应统一格式：

```json
{ "code": 200, "data": {...}, "message": "success" }
```

| 模块 | 前缀 | 说明 |
|------|------|------|
| 认证 | `/api/auth/*` | 登录、注册、验证码、登出、用户信息、个人资料 |
| 系统管理 | `/api/system/*` | 用户、角色、部门、岗位、菜单、字典、参数、通知公告的 CRUD |
| 系统监控 | `/api/monitor/*` | 登录日志、操作日志、在线用户、服务监控、缓存监控 |
| 文件 | `/api/file/*` | 文件/图片上传、文件访问 |
| 代码生成 | `/api/gen/*` | 表配置、字段配置、预览、生成 |

> 除登录、注册、验证码等公开接口外，其余接口均需 `Authorization: Bearer <token>`。

## Prisma 数据模型

Schema 文件位于 `apps/backend/prisma/schema.prisma`，共定义 15 个模型：

**系统核心（8 个）**

- `SysUser` — 用户表（含部门、岗位、角色关联、软删除）
- `SysRole` — 角色表（含菜单权限 JSON、数据权限范围）
- `SysDept` — 部门表（自引用树结构）
- `SysPost` — 岗位表
- `SysMenu` — 菜单表（自引用树，支持目录/菜单/按钮三种类型）
- `SysDictType` / `SysDictData` — 字典类型与字典数据
- `SysConfig` — 系统参数配置
- `SysNotice` — 通知公告

**日志与监控（2 个）**

- `SysLoginLog` — 登录日志
- `SysOperLog` — 操作日志

**定时任务（2 个）**

- `SysJob` — 定时任务配置
- `SysJobLog` — 定时任务执行日志

**代码生成（2 个）**

- `GenTable` — 生成表配置
- `GenTableField` — 生成字段配置

**租户（1 个）**

- `SysTenant` — 租户信息

## 项目状态与已知问题

### 已实现

- 认证模块（登录、注册、验证码、JWT、登出、个人资料）
- 系统管理全部 CRUD 接口与前端页面
- 系统监控全部接口与前端页面
- 文件上传与管理
- Web 管理后台（Vben Admin）：登录、Dashboard、个人中心、系统管理与监控页面、动态菜单、权限路由、偏好持久化
- 移动端基础页面（登录、首页、个人中心、资料、密码）

### 部分实现

- **代码生成器**：表配置、字段配置、预览和生成接口已可用，但生成逻辑仍偏模板化，数据库字段同步为占位实现。

### 预留未实现

- **定时任务**：`SysJob`、`SysJobLog` 模型已建，源码中未引用 `ScheduleModule`，无业务处理器和前端页面。
- **租户**：`SysTenant` 模型已定义，无业务接口和前端页面。

### 已知问题

1. 移动端 `apps/app/package.json` 未声明 `pinia` 依赖，但源码中已使用，需手动安装。
2. 仓库根目录仅把 `apps/backend` 与 `apps/app` 纳入 pnpm workspace；`apps/vben-admin` 是自带 workspace 的子 monorepo，需要在该子目录独立 `pnpm install`。
3. Vben Admin 5 强制要求 Node ≥ 22.18 与 pnpm ≥ 11，可通过 `corepack prepare pnpm@11.2.2 --activate` 一键启用。

## 文档

更多说明见 `docs/` 目录：

- `docs/api.md` — API 接口说明
- `docs/development.md` — 开发规范与目录结构
- `docs/deployment.md` — 部署指南（含 Docker、Nginx、PM2）
- `docs/faq.md` — 常见问题

> 历史文档 `.qoder/repowiki/zh/content/` 中部分文件可能仍引用旧目录 `apps/api` 和 `apps/web`，该目录由 Qoder 自动生成，可通过对应工具重新扫描仓库刷新。

## 常用命令

后端：

```bash
cd apps/backend
npm run start:dev
npm run build
npx prisma generate
npx prisma db push
```

Web 管理后台（Vben Admin 5 / pnpm）：

```bash
cd apps/vben-admin
pnpm install
pnpm dev:antd
pnpm build:antd
```

或使用根目录快捷命令：

```bash
pnpm vben:install    # 首次安装
pnpm vben:dev        # 等价于 pnpm --dir apps/vben-admin dev:antd
pnpm vben:build      # 等价于 pnpm --dir apps/vben-admin build:antd
```

移动端：

```bash
cd apps/app
npm run dev:h5
npm run build:h5
npm run dev:mp-weixin
npm run build:mp-weixin
```

## 许可证

MIT License
