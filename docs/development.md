# 开发指南

## 项目结构

```
Nest-Admin-Pro/
├── apps/
│   ├── api/           # NestJS 后端
│   │   └── src/
│   │       ├── auth/        # 认证模块
│   │       ├── cache/       # 缓存服务
│   │       ├── captcha/      # 验证码
│   │       ├── common/      # 通用（拦截器、异常、响应）
│   │       ├── config/       # 配置
│   │       ├── file/        # 文件上传
│   │       ├── mail/        # 邮件
│   │       └── modules/      # 业务模块
│   │           ├── system/   # 系统管理
│   │           ├── monitor/  # 监控管理
│   │           └── gen/      # 代码生成
│   ├── web/           # Vue 3 前端
│   │   └── src/
│   │       ├── api/         # 接口
│   │       ├── components/   # 组件
│   │       ├── router/      # 路由
│   │       ├── store/        # 状态管理
│   │       ├── styles/       # 样式
│   │       └── views/        # 页面
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

使用 Prisma schema 定义数据模型，参考 `apps/api/prisma/schema.prisma`

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

## 前端开发

### 页面创建

```bash
# 1. 创建页面目录
mkdir -p src/views/demo

# 2. 创建文件
# src/views/demo/index.vue
# src/views/demo/components/

# 3. 注册路由
```

### 组件规范

```vue
<template>
  <div class="demo-container">
    <el-table :data="list">
      <el-table-column prop="name" label="名称" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { demoApi } from '@/api';

const list = ref([]);
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await demoApi.list();
    list.value = res;
  } finally {
    loading.value = false;
  }
};
</script>
```

## 常用命令

```bash
# 后端
pnpm start:dev      # 开发模式
pnpm build          # 生产构建
pnpm start:prod     # 生产运行
pnpm prisma generate # 生成 Prisma Client
pnpm prisma migrate  # 数据库迁移
pnpm lint           # 代码检查

# 前端
pnpm dev            # 开发模式
pnpm build          # 生产构建
pnpm preview        # 预览构建结果

# 移动端
pnpm dev:h5         # H5 开发
pnpm build:h5       # H5 构建
pnpm dev:mp-weixin  # 微信小程序
```

## 环境变量

### 后端 (.env)

```env
# 数据库
DATABASE_URL=mysql://root:password@localhost:3306/ruoyi_vue_plus

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 前端 (.env.local)

```env
VITE_API_BASE_URL=http://localhost:3000/api
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