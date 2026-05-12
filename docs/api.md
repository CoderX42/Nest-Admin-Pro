# Nest-Admin-Pro API 文档

## 基础信息

| 项目 | 说明 |
|------|------|
| 基础 URL | `http://localhost:3000/api` |
| 认证方式 | Bearer Token (JWT) |
| 响应格式 | `{ code: 200, data: {...}, message: "success" }` |

## 认证接口

### 登录

```
POST /auth/login
Content-Type: application/json

Request:
{
  "username": "admin",
  "password": "admin123",
  "captcha": "1234",
  "captchaKey": "xxx"
}

Response:
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "nickname": "管理员",
      "roles": ["SUPER_ADMIN"]
    }
  },
  "message": "success"
}
```

### 获取用户信息

```
GET /auth/user/info
Authorization: Bearer <token>

Response:
{
  "code": 200,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "nickname": "管理员",
      "avatar": "",
      "email": "admin@example.com",
      "phone": "13800138000",
      "deptName": "技术部",
      "roles": ["SUPER_ADMIN"],
      "menus": [...]
    }
  }
}
```

### 登出

```
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "code": 200,
  "message": "success"
}
```

### 获取验证码

```
GET /auth/captcha

Response:
{
  "code": 200,
  "data": {
    "key": "xxx",
    "img": "data:image/png;base64,..."
  }
}
```

## 系统管理接口

### 用户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/user | 获取用户列表 |
| GET | /system/user/:id | 获取用户详情 |
| POST | /system/user | 创建用户 |
| PUT | /system/user/:id | 更新用户 |
| DELETE | /system/user/:id | 删除用户 |
| PUT | /system/user/:id/password | 重置密码 |
| PUT | /system/user/:id/status | 修改状态 |

### 部门管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/dept | 获取部门树 |
| GET | /system/dept/:id | 获取部门详情 |
| POST | /system/dept | 创建部门 |
| PUT | /system/dept/:id | 更新部门 |
| DELETE | /system/dept/:id | 删除部门 |

### 岗位管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/post | 获取岗位列表 |
| GET | /system/post/:id | 获取岗位详情 |
| POST | /system/post | 创建岗位 |
| PUT | /system/post/:id | 更新岗位 |
| DELETE | /system/post/:id | 删除岗位 |

### 菜单管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/menu | 获取菜单树 |
| GET | /system/menu/:id | 获取菜单详情 |
| POST | /system/menu | 创建菜单 |
| PUT | /system/menu/:id | 更新菜单 |
| DELETE | /system/menu/:id | 删除菜单 |

### 角色管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/role | 获取角色列表 |
| GET | /system/role/:id | 获取角色详情 |
| POST | /system/role | 创建角色 |
| PUT | /system/role/:id | 更新角色 |
| DELETE | /system/role/:id | 删除角色 |
| PUT | /system/role/:id/menus | 分配菜单权限 |

### 字典管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/dict/type | 获取字典类型列表 |
| POST | /system/dict/type | 创建字典类型 |
| PUT | /system/dict/type/:id | 更新字典类型 |
| DELETE | /system/dict/type/:id | 删除字典类型 |
| GET | /system/dict/data/:typeCode | 获取字典数据 |
| POST | /system/dict/data | 创建字典数据 |
| PUT | /system/dict/data/:id | 更新字典数据 |
| DELETE | /system/dict/data/:id | 删除字典数据 |

### 参数管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/config | 获取参数列表 |
| GET | /system/config/:id | 获取参数详情 |
| POST | /system/config | 创建参数 |
| PUT | /system/config/:id | 更新参数 |
| DELETE | /system/config/:id | 删除参数 |

### 通知公告

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/notice | 获取公告列表 |
| GET | /system/notice/:id | 获取公告详情 |
| POST | /system/notice | 创建公告 |
| PUT | /system/notice/:id | 更新公告 |
| DELETE | /system/notice/:id | 删除公告 |

## 监控管理接口

### 登录日志

```
GET /monitor/login-log
Query: { page, size, username, status, startTime, endTime }
```

### 操作日志

```
GET /monitor/oper-log
Query: { page, size, username, module, startTime, endTime }
```

### 在线用户

```
GET /monitor/online
DELETE /monitor/online/:token  // 强制下线
```

### 服务监控

```
GET /monitor/server
返回: CPU、内存、磁盘使用率，运行时长等信息
```

### 缓存监控

```
GET /monitor/cache
返回: Redis 信息、键数量、内存使用等

DELETE /monitor/cache  // 清空缓存
GET /monitor/cache/keys  // 获取键列表
GET /monitor/cache/:key  // 获取值
```

## 文件接口

### 上传文件

```
POST /file/upload
Content-Type: multipart/form-data

Request:
  file: <file>

Response:
{
  "code": 200,
  "data": {
    "url": "/uploads/xxx.png",
    "filename": "xxx.png",
    "size": 12345
  }
}
```

## 通用响应码

| 响应码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |