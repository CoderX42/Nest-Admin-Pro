# Nest-Admin-Pro 部署文档

## 环境要求

| 环境 | 版本 | 说明 |
|------|------|------|
| Node.js | 22.18+ | 后端 / Vben Admin 运行 |
| MySQL | 8.0+ | 数据库 |
| Redis | 7.0+ | 缓存（可选） |
| pnpm | 11.x | Vben Admin 强制要求 |
| npm | 10+ | 后端 / 移动端使用 |

## 后端部署

### 1. 环境配置

```bash
cd apps/backend

# 复制环境配置（如有 .env.example）
cp .env.example .env 2>/dev/null || true

# 编辑 .env 配置数据库和 Redis
```

### 2. 环境变量说明

```env
# 数据库
DATABASE_URL="mysql://root:password@localhost:3306/nest_admin_pro"

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
FI# Nest-Admin-Pro 部署文档

## 环境要求

| 环境 | 版本 | 说明 |
|------|------|--FI
## 环境要求

| 环境 |D_P
| 环境 | ?IL|------|------|------|
| Nocd| Node.js | 22.18+ | OU| MySQL | 8.0+ | 数据库 |
| Redis | 7.0+ | ?b| Redis | 7.0+ | 缓存（?l| pnpm | 11.x | Vben Admin 强制要 g| npm | 10+ | 后端 / 移动端使用 |te
## 后端部署

### 1. 环境配置

???### 1. 环境 -u
```bash
cd apps/bn_pcd app./
# 复制环?.scp .env.example .env 2>/dev/null || true

# ??# 编辑 .env 配置数据库和 Redis
np```

### 2. 环境变量说明

```en##
#. P
```env
# 数据库
DATA）# 数baDATABASE_U? 
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ameREDIS_apREDIS_PORT=6379
RED??EDIS_PASSWORD ?# JWT
JWT_SEC动JWT_ sJWT_EXPIRES_IN=7d

# 上佲
# 上传
UPLOAD??
UPLOAD_ ?AX_FILE_SIZE=10485h
FILE_STORAGE=local

#re
# 对象存储?epFILE_CLOUD_REGION=oss-cn-hangzhou
FILE_CLOUD_BUCKET=your-bucket?ILE_CLOUD_BUCKET=your-bucket
FI/aFI# Nest-Admin-Pro 部署文`?## 环境要求

| 环境 | ?BA
| 环境 | ?AP|------|------|--FI
## 环?a## 环境要求

|??| 环境 |D_Ppm | 环境 | ?`| Nocd| Node.js | 22.18+ | OU| MySQL mi| Redis | 7.0+ | ?b| Redis | 7.0+ | 缓存（?l| pnpmse## 后端部署

### 1. 环境配置

???### 1. 环境 -u
```bash
cd apps/bn_pcd app./
# 复制环?.scp .env.example .env 2>/dn-
### 1. 环境adm
???### 1. 环境ist```bash
cd apps/bn_excd app
 # 复制环?.scp ri
# ??# 编辑 .env 配置数据库和 Redis
np```

###ocanp```

### 2. 环境变量说明

```en##
lh
###300
```en##
#. P
```env
# ?er#. P
`$h```;
# 数  DATA）# ?h# Redis
REDIS_HOST=localhddREDIS_  REDIS_PORT=6379
RED XREDIS_PASSWORD $
# ameREDIS_aprwaRED??EDIS_PASSWORD ?# JWT??JWT_SEC动JWT_ sJWT_EXPIRE/u
# 上佲
# 上传
UPLOAD??
UPLOnes# 上?pUPLOAD?/bUPLOAD_upFILE_STORAGE=local

#re
# ? 
#re
# 对象存?ke# ?ILE_CLOUD_BUCKET=your-bucket?ILE_CLOUD_BUCKET=yoe:FI/aFI# Nest-Admin-Pro 部署文`?## 环境要求

| 环?-
| 环境 | ?BA
| 环境 | ?AP|------|------|-un | 环境 | ?de## 环?a## 环境要求

|??| ?=
|??| 环境 |D_Ppm | t
C
### 1. 环境配置

???### 1. 环境 -u
```bash
cd apps/bn_pcd app./
# 复制环?.scp .env.example .env 2>/dn-
### 1. 环境adm
???### 1. ?is
???### 1. 环境## ```bash
cd apps/bn_
`cd app
v# 复制环?.scp "### 1. 环境adm