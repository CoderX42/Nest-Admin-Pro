# Nest-Admin-Pro 部署文档

## 环境要求

| 环境 | 版本 | 说明 |
|------|------|------|
| Node.js | 18.x+ | 后端运行环境 |
| MySQL | 8.0+ | 数据库 |
| Redis | 7.0+ | 缓存（可选） |
| pnpm | 8.x | 包管理器 |

## 后端部署

### 1. 环境配置

```bash
cd apps/api

# 复制环境配置
cp .env.example .env

# 编辑 .env 配置数据库和 Redis
```

### 2. 环境变量说明

```env
# 数据库
DATABASE_URL="mysql://root:password@localhost:3306/ruoyi_vue_plus"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

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

### 3. 数据库初始化

```bash
# 安装依赖
pnpm install

# 生成 Prisma Client
pnpm prisma generate

# 执行迁移
pnpm prisma migrate dev --name init

# 导入种子数据（可选）
mysql -u root -p ruoyi_vue_plus < ../../scripts/seed.sql
```

### 4. 启动服务

```bash
# 开发环境
pnpm start:dev

# 生产环境
pnpm build
pnpm start:prod
```

### 5. PM2 部署（生产环境）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start dist/main.js --name nest-api

# 保存进程列表
pm2 save

# 设置开机启动
pm2 startup
```

## 前端部署

### 1. 安装依赖

```bash
cd apps/web
pnpm install
```

### 2. 配置环境

```bash
cp .env.example .env.local
```

### 3. 构建

```bash
# 开发构建
pnpm build:dev

# 生产构建
pnpm build
```

### 4. Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/nest-admin-pro/apps/web/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 上传文件访问
    location /uploads {
        alias /path/to/nest-admin-pro/apps/api/uploads;
        autoindex on;
    }
}
```

## Docker 部署

### 后端 Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@mysql:3306/ruoyi_vue_plus
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis

  web:
    build: ./apps/web
    ports:
      - "80:80"
    depends_on:
      - api

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: ruoyi_vue_plus
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

## 常见问题

### 1. 端口被占用

```bash
# Linux/Mac 查看端口
lsof -i :3000

# Windows
netstat -ano | findstr :3000

# 杀死进程
kill -9 <PID>
```

### 2. 数据库连接失败

- 检查 MySQL 服务是否启动
- 验证用户名密码是否正确
- 确认数据库已创建

### 3. Redis 连接失败

- 如果不使用 Redis，可以关闭相关功能
- 或使用 `REDIS_ENABLED=false` 禁用

### 4. 跨域问题

后端已配置 CORS，如需调整修改 `apps/api/src/main.ts`

### 5. 静态资源404

```nginx
# 确保 Nginx 配置了 try_files
try_files $uri $uri/ /index.html;
```
