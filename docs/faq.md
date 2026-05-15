# Nest-Admin-Pro 常见问题 (FAQ)

## 快速入门

### Q: 如何启动项目？

**后端：**
```bash
cd apps/api
pnpm install
pnpm prisma generate
pnpm start:dev
# 访问 http://localhost:3000
```

**前端：**
```bash
cd apps/web
pnpm install
pnpm dev
# 访问 http://localhost:5173
```

**移动端：**
```bash
cd apps/app
pnpm install
pnpm dev:h5
# 访问 http://localhost:5170
```

---

## 数据库问题

### Q: 数据库连接失败？

1. 检查 MySQL 服务是否启动
2. 验证 `.env` 中的 `DATABASE_URL` 配置
3. 确保数据库已创建：`CREATE DATABASE ruoyi_vue_plus`

### Q: 如何初始化数据库？

```bash
cd apps/api
npx prisma migrate dev --name init
```

或导入 SQL：
```bash
mysql -u root -p ruoyi_vue_plus < ../../scripts/seed.sql
```

### Q: 如何重置数据库？

```bash
cd apps/api
npx prisma migrate reset
```

---

## 登录问题

### Q: 默认账号密码？

- 用户名：`admin`
- 密码：`admin123`

### Q: 登录失败，提示"验证码错误"？

验证码已开启，可通过以下方式关闭：
1. 后台管理 → 系统参数 → `sys_login_captcha` → 设为 `false`
2. 或修改数据库 `sys_config` 表

### Q: Token 过期了怎么办？

Token 默认 7 天过期，过期后需要重新登录。

---

## 前端问题

### Q: 页面空白？

1. 检查浏览器控制台是否有错误
2. 确认后端 API 是否正常运行
3. 检查 `.env` 中的 `VITE_API_BASE_URL` 配置

### Q: 菜单不显示？

1. 检查用户是否分配了菜单权限
2. 确认菜单的 `status` 为启用状态
3. 查看浏览器 Network 请求是否有权限错误

---

## 移动端问题

### Q: 微信登录配置？

1. 在 `manifest.json` 配置微信 AppID
2. 后端配置微信小程序 AppID 和 AppSecret
3. 调用 `/auth/wx/login` 接口

### Q: H5 模式无法真机调试？

1. 确保手机和电脑在同一网络
2. 使用手机访问电脑 IP + 端口
3. 检查防火墙设置

---

## 部署问题

### Q: PM2 启动失败？

```bash
# 查看错误日志
pm2 logs nest-api

# 常见问题
# 1. 端口被占用 → 更改端口或杀死占用进程
# 2. 缺少环境变量 → 检查 .env 文件
# 3. Prisma 未生成 → 运行 npx prisma generate
```

### Q: Nginx 404？

```nginx
# 确保添加 try_files
location / {
    try_files $uri $uri/ /index.html;
}
```

### Q: 如何配置 HTTPS？

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        # ... 配置
    }
}
```

---

## 功能问题

### Q: 如何添加自定义菜单？

后台管理 → 系统管理 → 菜单管理 → 新增菜单

### Q: 如何分配权限？

后台管理 → 系统管理 → 角色管理 → 编辑角色 → 分配菜单权限

### Q: 数据范围权限有什么用？

控制用户可见的数据范围：
- 全部数据：可见所有数据
- 本部门：仅可见本部门数据
- 仅本人：仅可见自己的数据

### Q: 如何配置定时任务？

后台管理 → 代码生成 → 定时任务（需要代码生成模块支持）

---

## 其他问题

### Q: 如何更新代码？

```bash
git pull origin main
pnpm install
pnpm prisma generate
pnpm build
pm2 restart nest-api
```

### Q: 如何查看日志？

```bash
# 后端日志
pm2 logs nest-api

# Nginx 日志
tail -f /var/log/nginx/access.log
```

### Q: 如何备份数据库？

```bash
mysqldump -u root -p ruoyi_vue_plus > backup.sql
```