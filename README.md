# Nest-Admin-Pro

全栈快速开发框架 - 个人开发者接单神器

## 项目简介

基于 NestJS 11 + Prisma 5 + Vue 3 + Element Plus + Uniapp 的全栈快速开发框架，专为个人开发者和小团队打造。

### 核心特性

- **真正的全栈一体化**：后端、管理端、移动端三端代码在一个仓库
- **最强代码生成器**：支持从数据库表到 NestJS 后端、Vue3 前端、Uniapp 移动端的全栈代码生成
- **微信生态深度集成**：一键配置微信小程序登录、支付、订阅消息
- **极致的开发体验**：全链路 TypeScript 类型安全
- **接单友好**：内置多租户、白标、一键部署等接单必备功能

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端核心 | NestJS | 11.x |
| ORM | Prisma | 5.x |
| 数据库 | MySQL | 8.0 |
| 缓存 | Redis | 7.0 |
| 认证 | JWT | - |
| 前端核心 | Vue | 3.4+ |
| UI组件库 | Element Plus | 2.6+ |
| 构建工具 | Vite | 5.x |
| 状态管理 | Pinia | 2.x |
| 移动端 | Uniapp | Vue 3版 |

## 功能模块

### 系统管理（14 大模块）

1. 用户管理 - CRUD、状态管理、密码重置、多角色分配、头像上传
2. 部门管理 - 树形组织架构、CRUD、排序
3. 岗位管理 - CRUD、状态管理、排序
4. 菜单管理 - 树形菜单、目录/菜单/按钮类型、图标配置、权限标识
5. 角色管理 - CRUD、菜单权限分配、数据范围权限（全部/自定义/本部门/仅本人）
6. 字典管理 - 字典类型 + 字典数据分离
7. 参数管理 - 动态参数修改（无需重启）
8. 通知公告 - CRUD、状态管理、定时发布

### 系统监控

9. 登录日志 - 登录记录、异常记录、IP地点、浏览器信息
10. 操作日志 - 用户操作记录查询
11. 在线用户 - 当前在线用户、强制下线
12. 服务监控 - CPU/内存/磁盘使用率
13. 缓存监控 - Redis 缓存信息、键列表、清除缓存

### 代码生成器

14. 全栈代码生成 - 数据库表导入 → 后端代码 → 前端代码 → Uniapp代码 → SQL脚本 → ZIP下载

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL 8.0
- Redis 7.0

### 后端启动

```bash
cd apps/api

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接

# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run start:dev
```

### 前端启动

```bash
cd apps/web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 访问

- 前端管理后台：http://localhost:5173
- 后端 API：http://localhost:3000
- 接口文档：http://localhost:3000/api-docs

### 默认账号

- 用户名：admin
- 密码：admin123

## 项目结构

```
Nest-Admin-Pro/
├── apps/
│   ├── api/              # NestJS 后端
│   ├── web/              # Vue 3 管理后台
│   └── app/              # Uniapp 移动端
├── packages/
│   └── shared/           # 共享类型定义
├── prisma/
│   └── schema.prisma     # 数据库模型
└── docs/                 # 项目文档
```

## 许可证

MIT License