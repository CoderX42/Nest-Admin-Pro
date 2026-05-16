# Nest-Admin-Pro

Nest-Admin-Pro 是一个基于 NestJS、Prisma、Vue 3、Element Plus 和 UniApp 的全栈后台管理系统模板。项目采用多应用目录组织，将后端 API、Web 管理后台和移动端应用放在同一个仓库中，适合作为中小型管理系统、接单项目或二次开发脚手架。

## 项目状态

当前仓库已经包含后台管理系统的主要骨架和基础模块，但仍有部分能力处于预留或开发中状态：

- 已实现：认证、系统管理、监控管理、文件上传、Web 管理后台基础页面、UniApp 基础页面。
- 部分实现：代码生成器目前支持表配置、字段配置、预览和生成接口，但生成逻辑仍偏模板化，数据库字段同步为占位实现。
- 预留模型：定时任务、任务日志、租户等 Prisma 模型已定义，但还没有完整业务接口和前端页面。
- 数据初始化：仓库当前未包含 Prisma migration 或 seed 文件，首次运行需要自行准备数据库结构和初始账号数据。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 后端 | NestJS 11、TypeScript、JWT、Swagger |
| ORM | Prisma 5 |
| 数据库 | MySQL |
| 缓存 | Redis、ioredis |
| Web 前端 | Vue 3、Vite、Element Plus、Pinia、Vue Router、Axios |
| 移动端 | UniApp、Vue 3 |

## 应用目录

```text
Nest-Admin-Pro/
├── apps/
│   ├── backend/          # NestJS 后端 API
│   ├── fronted/          # Vue 3 + Element Plus 管理后台
│   └── app/              # UniApp 移动端
├── docs/                 # 项目文档
└── scripts/              # 辅助脚本说明
```

> 注意：当前实际目录名是 `apps/backend` 和 `apps/fronted`，不是旧文档中的 `apps/api` 和 `apps/web`。

## 后端功能

后端位于 `apps/backend`，全局 API 前缀为 `/api`，默认端口为 `3000`。

主要模块：

- 认证：登录、注册、验证码、登出、获取当前用户信息。
- 系统管理：用户、角色、部门、岗位、菜单、字典、系统参数、通知公告。
- 系统监控：登录日志、操作日志、在线用户、服务器信息、Redis 缓存信息。
- 文件管理：文件上传、图片上传、上传文件访问。
- 代码生成：生成表配置、字段配置、代码预览和基础生成接口。
- 通用能力：统一响应格式、全局异常过滤器、参数校验、接口限流、Swagger 文档。

## Web 管理后台

Web 管理后台位于 `apps/fronted`，默认开发端口为 `5173`。

已包含页面：

- 登录页
- 首页仪表盘
- 用户管理
- 角色管理
- 部门管理
- 岗位管理
- 菜单管理
- 字典管理
- 参数管理
- 通知公告
- 登录日志
- 操作日志
- 在线用户
- 服务监控
- 缓存监控

开发服务器已配置代理：

- `/api` -> `http://localhost:3000`
- `/file` -> `http://localhost:3000`

## UniApp 移动端

移动端位于 `apps/app`。

当前包含：

- 登录页
- 首页
- 个人中心
- 个人资料
- 修改密码
- 文件上传头像接口封装
- 微信登录、手机号能力的 API 调用封装预留

## 环境要求

- Node.js >= 18
- MySQL
- Redis
- npm

三个应用目前没有根目录 workspace 脚本，需要分别进入对应目录安装依赖和启动。

## 快速开始

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
```

生成 Prisma Client：

```bash
npx prisma generate
```

当前仓库未提交 migration 文件。首次建库可根据需要使用：

```bash
npx prisma db push
```

启动后端：

```bash
npm run start:dev
```

访问地址：

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api-docs`
- Swagger 备用地址：`http://localhost:3000/doc.html`

### 2. 启动 Web 管理后台

```bash
cd apps/fronted
npm install
npm run dev
```

访问地址：

```text
http://localhost:5173
```

### 3. 启动 UniApp

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

## 常用命令

后端：

```bash
cd apps/backend
npm run start:dev
npm run build
npx prisma generate
npx prisma db push
```

Web 管理后台：

```bash
cd apps/fronted
npm run dev
npm run build
npm run preview
```

UniApp：

```bash
cd apps/app
npm run dev:h5
npm run build:h5
npm run dev:mp-weixin
npm run build:mp-weixin
```

## 主要 API 路径

认证：

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/captcha`
- `POST /api/auth/captcha/validate`
- `POST /api/auth/logout`
- `GET /api/auth/user/info`

系统管理：

- `/api/system/user`
- `/api/system/role`
- `/api/system/dept`
- `/api/system/post`
- `/api/system/menu`
- `/api/system/dict`
- `/api/system/config`
- `/api/system/notice`

系统监控：

- `/api/monitor/login-log`
- `/api/monitor/oper-log`
- `/api/monitor/online`
- `/api/monitor/server`
- `/api/monitor/cache`

其他：

- `/api/file`
- `/api/gen`

## 数据库模型概览

Prisma schema 位于 `apps/backend/prisma/schema.prisma`，当前定义了以下模型：

- 系统核心：`SysUser`、`SysRole`、`SysDept`、`SysPost`、`SysMenu`
- 字典与配置：`SysDictType`、`SysDictData`、`SysConfig`、`SysNotice`
- 日志监控：`SysLoginLog`、`SysOperLog`
- 定时任务预留：`SysJob`、`SysJobLog`
- 代码生成：`GenTable`、`GenTableField`
- 租户预留：`SysTenant`

## 默认账号

旧文档中提到默认账号为：

```text
用户名：admin
密码：admin123
```

但当前仓库没有 seed 文件自动创建该账号。若本地数据库没有初始数据，需要手动插入用户、角色和菜单数据，或补充 Prisma seed。

## 文档

更多说明见：

- `docs/api.md`
- `docs/development.md`
- `docs/deployment.md`
- `docs/faq.md`

部分文档仍沿用旧目录名或规划中的功能，使用时请以当前源码为准。

## 许可证

MIT License
