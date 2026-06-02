# 02 · 数据模型重整

> 本文档定义 S2 阶段对 Prisma schema 的**一次性重写**,以及对应的 migrate / seed 方案。S0/S1 不修改 schema,所有模型变更集中在 S2 一次完成。
>
> 本文规约的 schema 是**目标态**,任务卡 03/04/05 中所有引用的字段名、关系、表名都以本文为准。
>
> ⚠️ 本次重写为破坏性变更:`prisma db push` 历史将清空,改用 `prisma migrate`。**本地开发者需重置数据库**(`pnpm db:reset`)。

---

## 1. 重写目标

| 目标 | 当前问题 | 重写后 |
| --- | --- | --- |
| 表名 snake_case + 前缀分组 | 当前是 PascalCase 物理表名 | `@@map("sys_user")` 等 |
| 字段标准化 | `createTime/updateTime/deleteTime/isDelete` 与公司行业惯例不一致 | 统一 `createdAt / updatedAt / deletedAt`(软删用 `deletedAt is not null`,移除独立 `isDelete`)|
| 关联表正规化 | `userRoles/postIds/menuIds/deptIds` 用 JSON 字符串 | 引入显式中间表 `sys_user_role / sys_user_post / sys_role_menu / sys_role_dept` |
| 多租户支持 | 0 处生效 | 加 `tenantId` 字段 + Prisma 中间件 |
| 字段类型规范化 | `external/show/keepAlive/status` 等都用 Int 0/1 | 统一为 `Int @default(...)`,通过枚举约束(应用层 enum) |
| 索引完善 | 单字段索引为主,缺组合索引 | 补 `(tenantId, deletedAt)` / `(tenantId, status)` 等组合索引 |
| 软删一致性 | 部分表有 `deleteTime`,部分没有 | 业务关键表统一支持软删,日志表只硬删 |
| 软删 + 唯一键 | 当前未处理:`username` unique 后软删则无法重建 | **唯一索引把 `deletedAt` 一起加进去**(`@@unique([tenantId, username, deletedAt])`)。MySQL `NULL` 在 unique 中视为不同值,因此活跃记录(`deletedAt=null`)只能有一条,软删记录因 `deletedAt` 各不相同允许多条 |
| 平台 vs 租户隔离 | 角色未区分平台/租户 | `SysRole.tenantId` 为 null = 平台级,否则租户级 |

---

## 2. 命名约定回顾

(详见 `01-conventions.md` § 4.1)

- model 名:`PascalCase`(如 `SysUser`)
- 物理表名:`snake_case`,通过 `@@map` 显式映射
- 字段名(Prisma):`camelCase`,通过 `@map` 映射列名(`snake_case`)
- 主键统一 `id BigInt @id @default(autoincrement())`,列名 `id`
- 公共字段:`createdAt / updatedAt / deletedAt / createdBy / updatedBy / tenantId`
- BigInt 序列化:JWT/响应中用字符串(由 `class-transformer` + 全局 transformer 处理),不通过 `BigInt.prototype.toJSON` 全局污染

---

## 3. 模型清单与租户感知

共 **21 个模型**(原 17 个 + 新增 4 个中间表),分组如下:

| # | 模型 | 表名 | 租户感知 | 软删 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 1 | `SysUser` | `sys_user` | ✅ | ✅ | 用户 |
| 2 | `SysRole` | `sys_role` | ⚠️ 可空 | ✅ | 角色;`tenantId=null` 为平台级 |
| 3 | `SysDept` | `sys_dept` | ✅ | ✅ | 部门(树) |
| 4 | `SysPost` | `sys_post` | ✅ | ✅ | 岗位 |
| 5 | `SysMenu` | `sys_menu` | ❌ | ✅ | 菜单(平台共享,所有租户使用同一套菜单) |
| 6 | `SysDictType` | `sys_dict_type` | ❌ | ✅ | 字典类型(全局共享) |
| 7 | `SysDictData` | `sys_dict_data` | ❌ | ✅ | 字典值 |
| 8 | `SysConfig` | `sys_config` | ❌ | ✅ | 系统参数(全局) |
| 9 | `SysNotice` | `sys_notice` | ✅ | ✅ | 通知公告 |
| 10 | `SysFile` | `sys_file` | ✅ | ✅ | 文件 |
| 11 | `SysLoginLog` | `sys_login_log` | ✅ | ❌ | 登录日志(只硬删,定期归档) |
| 12 | `SysOperLog` | `sys_oper_log` | ✅ | ❌ | 操作日志 |
| 13 | `SysJob` | `sys_job` | ✅ | ✅ | 定时任务 |
| 14 | `SysJobLog` | `sys_job_log` | ✅ | ❌ | 任务日志 |
| 15 | `SysTenant` | `sys_tenant` | ❌(自身即租户) | ✅ | 租户 |
| 16 | `GenTable` | `gen_table` | ❌ | ❌ | 代码生成器表配置(平台级工具) |
| 17 | `GenTableField` | `gen_table_field` | ❌ | ❌ | 代码生成器字段配置 |
| 18 | `SysUserRole` | `sys_user_role` | — | — | 用户角色关系 |
| 19 | `SysUserPost` | `sys_user_post` | — | — | 用户岗位关系 |
| 20 | `SysRoleMenu` | `sys_role_menu` | — | — | 角色菜单权限 |
| 21 | `SysRoleDept` | `sys_role_dept` | — | — | 角色自定义数据范围(`dataScope=5` 时使用) |

> **租户感知**列说明 Prisma 中间件是否会自动注入 `where: { tenantId }` 与 `data: { tenantId }`。中间表通过其外键所属主表实现间接隔离,中间件不直接处理。

---

## 4. 完整 schema 目标态

完整最终版 `apps/backend/prisma/schema.prisma`:

```prisma
// ============================================================
//  Nest-Admin-Pro Prisma Schema
//  S2 重写版本,后续变更必须通过 prisma migrate dev 生成新迁移
// ============================================================

generator client {
  provider        = "prisma-client-js"
  previewFeatures = []
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============================================================
//  租户
// ============================================================

model SysTenant {
  id          BigInt    @id @default(autoincrement())
  name        String    @db.VarChar(100)
  code        String    @unique @db.VarChar(50)
  contactUser String?   @map("contact_user") @db.VarChar(50)
  contactPhone String?  @map("contact_phone") @db.VarChar(20)
  status      Int       @default(1)                          // 1 启用 / 0 停用
  expireAt    DateTime? @map("expire_at")
  maxUsers    Int       @default(100) @map("max_users")
  packageCode String?   @map("package_code") @db.VarChar(50) // 套餐 code,预留
  remark      String?   @db.VarChar(500)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  createdBy   BigInt?   @map("created_by")
  updatedBy   BigInt?   @map("updated_by")

  users       SysUser[]
  roles       SysRole[]
  depts       SysDept[]
  posts       SysPost[]
  notices     SysNotice[]
  files       SysFile[]
  loginLogs   SysLoginLog[]
  operLogs    SysOperLog[]
  jobs        SysJob[]
  jobLogs     SysJobLog[]

  @@index([code])
  @@index([status])
  @@map("sys_tenant")
}

// ============================================================
//  用户
// ============================================================

model SysUser {
  id          BigInt    @id @default(autoincrement())
  tenantId    BigInt?   @map("tenant_id")
  username    String    @db.VarChar(50)
  password    String    @db.VarChar(200)
  nickname    String    @db.VarChar(50)
  avatar      String    @default("") @db.VarChar(255)
  email       String?   @db.VarChar(100)
  phone       String?   @db.VarChar(20)
  gender      Int       @default(0)                           // 0 未知 / 1 男 / 2 女
  status      Int       @default(1)                           // 1 启用 / 0 禁用
  remark      String?   @db.VarChar(500)
  deptId      BigInt?   @map("dept_id")
  loginIp     String?   @map("login_ip") @db.VarChar(50)
  loginAt     DateTime? @map("login_at")
  pwdResetAt  DateTime? @map("pwd_reset_at")
  isPlatformAdmin Int   @default(0) @map("is_platform_admin") // 1 平台超管(可跨租户)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  createdBy   BigInt?   @map("created_by")
  updatedBy   BigInt?   @map("updated_by")

  tenant      SysTenant? @relation(fields: [tenantId], references: [id])
  dept        SysDept?   @relation(fields: [deptId], references: [id])
  userRoles   SysUserRole[]
  userPosts   SysUserPost[]
  files       SysFile[]
  loginLogs   SysLoginLog[]
  operLogs    SysOperLog[]

  @@unique([tenantId, username, deletedAt], map: "uq_sys_user_tenant_username")
  @@index([tenantId, deletedAt])
  @@index([deptId])
  @@index([username])
  @@index([phone])
  @@index([email])
  @@map("sys_user")
}

// ============================================================
//  角色
// ============================================================

model SysRole {
  id          BigInt    @id @default(autoincrement())
  tenantId    BigInt?   @map("tenant_id")                     // null = 平台级角色(如 platform_admin)
  name        String    @db.VarChar(50)
  code        String    @db.VarChar(50)
  sort        Int       @default(0)
  status      Int       @default(1)
  dataScope   Int       @default(1) @map("data_scope")        // 见 DataScope 枚举
  remark      String?   @db.VarChar(500)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  createdBy   BigInt?   @map("created_by")
  updatedBy   BigInt?   @map("updated_by")

  tenant      SysTenant? @relation(fields: [tenantId], references: [id])
  userRoles   SysUserRole[]
  roleMenus   SysRoleMenu[]
  roleDepts   SysRoleDept[]

  @@unique([tenantId, code, deletedAt], map: "uq_sys_role_tenant_code")
  @@index([tenantId, deletedAt])
  @@index([code])
  @@map("sys_role")
}

// ============================================================
//  部门(树)
// ============================================================

model SysDept {
  id          BigInt    @id @default(autoincrement())
  tenantId    BigInt?   @map("tenant_id")
  parentId    BigInt    @default(0) @map("parent_id")
  ancestors   String    @default("") @db.VarChar(500)         // 0,1,5 形式,加速 in 查询
  name        String    @db.VarChar(50)
  sort        Int       @default(0)
  leaderId    BigInt?   @map("leader_id")
  phone       String?   @db.VarChar(20)
  email       String?   @db.VarChar(100)
  status      Int       @default(1)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  createdBy   BigInt?   @map("created_by")
  updatedBy   BigInt?   @map("updated_by")

  tenant      SysTenant? @relation(fields: [tenantId], references: [id])
  parent      SysDept?   @relation("DeptChildren", fields: [parentId], references: [id])
  children    SysDept[]  @relation("DeptChildren")
  users       SysUser[]
  roleDepts   SysRoleDept[]

  @@index([tenantId, deletedAt])
  @@index([parentId])
  @@index([sort])
  @@map("sys_dept")
}

// ============================================================
//  岗位
// ============================================================

model SysPost {
  id          BigInt    @id @default(autoincrement())
  tenantId    BigInt?   @map("tenant_id")
  name        String    @db.VarChar(50)
  code        String    @db.VarChar(50)
  sort        Int       @default(0)
  status      Int       @default(1)
  remark      String?   @db.VarChar(500)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  createdBy   BigInt?   @map("created_by")
  updatedBy   BigInt?   @map("updated_by")

  tenant      SysTenant? @relation(fields: [tenantId], references: [id])
  userPosts   SysUserPost[]

  @@unique([tenantId, code, deletedAt], map: "uq_sys_post_tenant_code")
  @@index([tenantId, deletedAt])
  @@map("sys_post")
}

// ============================================================
//  菜单(平台共享,所有租户共用一套)
// ============================================================

model SysMenu {
  id          BigInt    @id @default(autoincrement())
  parentId    BigInt    @default(0) @map("parent_id")
  name        String    @db.VarChar(50)                       // 菜单名(显示用,中文)
  i18nKey     String?   @map("i18n_key") @db.VarChar(100)     // 国际化 key,如 menu.system.user
  type        Int       @default(1)                           // 1 目录 / 2 菜单 / 3 按钮
  path        String?   @db.VarChar(255)
  component   String?   @db.VarChar(255)
  query       String?   @db.VarChar(255)
  icon        String?   @db.VarChar(100)
  sort        Int       @default(0)
  perms       String?   @db.VarChar(100)                       // 权限标识,如 system:user:add
  status      Int       @default(1)                           // 1 启用 / 0 停用
  isExternal  Int       @default(0) @map("is_external")       // 1 外链
  isCache     Int       @default(0) @map("is_cache")          // 1 keep-alive
  isVisible   Int       @default(1) @map("is_visible")        // 1 显示
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  parent      SysMenu?  @relation("MenuChildren", fields: [parentId], references: [id])
  children    SysMenu[] @relation("MenuChildren")
  roleMenus   SysRoleMenu[]

  @@index([parentId])
  @@index([sort])
  @@index([perms])
  @@map("sys_menu")
}

// ============================================================
//  字典(平台共享)
// ============================================================

model SysDictType {
  id          BigInt    @id @default(autoincrement())
  name        String    @db.VarChar(100)
  code        String    @unique @db.VarChar(100)
  status      Int       @default(1)
  remark      String?   @db.VarChar(500)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  items       SysDictData[]

  @@index([code])
  @@map("sys_dict_type")
}

model SysDictData {
  id          BigInt    @id @default(autoincrement())
  dictTypeId  BigInt    @map("dict_type_id")
  label       String    @db.VarChar(100)
  value       String    @db.VarChar(100)
  cssClass    String?   @map("css_class") @db.VarChar(100)    // 标签样式,如 success/warning
  listClass   String?   @map("list_class") @db.VarChar(100)
  sort        Int       @default(0)
  status      Int       @default(1)
  isDefault   Int       @default(0) @map("is_default")
  remark      String?   @db.VarChar(500)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  dictType    SysDictType @relation(fields: [dictTypeId], references: [id], onDelete: Cascade)

  @@unique([dictTypeId, value], map: "uq_sys_dict_data_type_value")
  @@index([dictTypeId, sort])
  @@map("sys_dict_data")
}

// ============================================================
//  系统配置(平台共享)
// ============================================================

model SysConfig {
  id          BigInt    @id @default(autoincrement())
  name        String    @db.VarChar(100)
  configKey   String    @unique @map("config_key") @db.VarChar(100)
  configValue String    @map("config_value") @db.Text
  valueType   String    @default("string") @map("value_type") @db.VarChar(20)  // string/number/boolean/json
  isBuiltin   Int       @default(0) @map("is_builtin")        // 1 内置不可删
  remark      String?   @db.VarChar(500)
  status      Int       @default(1)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  createdBy   BigInt?   @map("created_by")
  updatedBy   BigInt?   @map("updated_by")

  @@index([configKey])
  @@map("sys_config")
}

// ============================================================
//  通知公告
// ============================================================

model SysNotice {
  id          BigInt    @id @default(autoincrement())
  tenantId    BigInt?   @map("tenant_id")
  title       String    @db.VarChar(200)
  content     String    @db.Text
  type        Int       @default(1)                           // 1 通知 / 2 公告
  status      Int       @default(0)                           // 0 草稿 / 1 已发布 / 2 已撤回
  publishAt   DateTime? @map("publish_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  createdBy   BigInt?   @map("created_by")
  updatedBy   BigInt?   @map("updated_by")

  tenant      SysTenant? @relation(fields: [tenantId], references: [id])

  @@index([tenantId, status, publishAt])
  @@map("sys_notice")
}

// ============================================================
//  文件
// ============================================================

model SysFile {
  id           BigInt    @id @default(autoincrement())
  tenantId     BigInt?   @map("tenant_id")
  originalName String    @map("original_name") @db.VarChar(255)
  fileName     String    @map("file_name") @db.VarChar(255)
  objectKey    String    @map("object_key") @db.VarChar(500)
  url          String    @db.VarChar(1000)
  storage      String    @db.VarChar(50)                       // local / aliyun-oss / ...
  mimeType     String?   @map("mime_type") @db.VarChar(100)
  ext          String?   @db.VarChar(20)
  size         BigInt    @default(0)
  bizType      String?   @map("biz_type") @db.VarChar(50)      // avatar / notice / import / ...
  uploaderId   BigInt?   @map("uploader_id")
  uploaderName String?   @map("uploader_name") @db.VarChar(50)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  uploader     SysUser?  @relation(fields: [uploaderId], references: [id])
  tenant       SysTenant? @relation(fields: [tenantId], references: [id])

  @@index([tenantId, deletedAt])
  @@index([storage])
  @@index([objectKey])
  @@index([uploaderId])
  @@index([bizType])
  @@index([createdAt])
  @@map("sys_file")
}

// ============================================================
//  日志
// ============================================================

model SysLoginLog {
  id          BigInt    @id @default(autoincrement())
  tenantId    BigInt?   @map("tenant_id")
  userId      BigInt?   @map("user_id")
  username    String    @db.VarChar(50)
  ip          String    @db.VarChar(50)
  location    String?   @db.VarChar(255)
  os          String?   @db.VarChar(100)
  browser     String?   @db.VarChar(100)
  device      String?   @db.VarChar(50)
  loginType   Int       @default(1) @map("login_type")        // 1 账号密码 / 2 微信小程序 / 3 短信(预留)
  status      Int       @default(1)                           // 1 成功 / 0 失败
  msg         String?   @db.VarChar(255)
  createdAt   DateTime  @default(now()) @map("created_at")

  user        SysUser?   @relation(fields: [userId], references: [id])
  tenant      SysTenant? @relation(fields: [tenantId], references: [id])

  @@index([tenantId, createdAt])
  @@index([userId])
  @@index([ip])
  @@index([username])
  @@map("sys_login_log")
}

model SysOperLog {
  id          BigInt    @id @default(autoincrement())
  tenantId    BigInt?   @map("tenant_id")
  userId      BigInt?   @map("user_id")
  username    String    @db.VarChar(50)
  module      String?   @db.VarChar(100)
  operation   String?   @db.VarChar(100)                       // 操作描述
  reqMethod   String?   @map("req_method") @db.VarChar(10)
  reqUrl      String    @map("req_url") @db.VarChar(500)
  reqParams   String?   @map("req_params") @db.Text
  reqIp       String?   @map("req_ip") @db.VarChar(50)
  reqUa       String?   @map("req_ua") @db.VarChar(500)
  reqOs       String?   @map("req_os") @db.VarChar(100)
  reqBrowser  String?   @map("req_browser") @db.VarChar(100)
  location    String?   @db.VarChar(255)
  respCode    Int?      @map("resp_code")
  respResult  String?   @map("resp_result") @db.Text
  status      Int       @default(1)                           // 1 成功 / 0 异常
  errorMsg    String?   @map("error_msg") @db.Text
  duration    Int?
  createdAt   DateTime  @default(now()) @map("created_at")

  user        SysUser?   @relation(fields: [userId], references: [id])
  tenant      SysTenant? @relation(fields: [tenantId], references: [id])

  @@index([tenantId, createdAt])
  @@index([userId])
  @@index([module])
  @@map("sys_oper_log")
}

// ============================================================
//  定时任务
// ============================================================

model SysJob {
  id            BigInt    @id @default(autoincrement())
  tenantId      BigInt?   @map("tenant_id")
  name          String    @db.VarChar(100)
  group         String    @default("default") @db.VarChar(50)
  invokeTarget  String    @map("invoke_target") @db.VarChar(200)  // beanName.method 或 beanName.method('arg1', 2)
  cronExpression String   @map("cron_expression") @db.VarChar(100)
  misfirePolicy Int       @default(1) @map("misfire_policy")      // 1 立即执行 / 2 执行一次 / 3 放弃
  concurrent    Int       @default(0)                             // 1 允许并发 / 0 禁止
  status        Int       @default(0)                             // 0 暂停 / 1 启用
  remark        String?   @db.VarChar(500)
  nextFireAt    DateTime? @map("next_fire_at")
  prevFireAt    DateTime? @map("prev_fire_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  createdBy     BigInt?   @map("created_by")
  updatedBy     BigInt?   @map("updated_by")

  logs          SysJobLog[]
  tenant        SysTenant? @relation(fields: [tenantId], references: [id])

  @@index([tenantId, status])
  @@index([invokeTarget])
  @@map("sys_job")
}

model SysJobLog {
  id          BigInt    @id @default(autoincrement())
  tenantId    BigInt?   @map("tenant_id")
  jobId       BigInt    @map("job_id")
  jobName     String    @map("job_name") @db.VarChar(100)
  invokeTarget String   @map("invoke_target") @db.VarChar(200)
  message     String?   @db.Text
  status      Int       @default(1)                           // 1 成功 / 0 异常
  errorMsg    String?   @map("error_msg") @db.Text
  duration    Int?
  startedAt   DateTime  @default(now()) @map("started_at")
  finishedAt  DateTime? @map("finished_at")

  job         SysJob     @relation(fields: [jobId], references: [id], onDelete: Cascade)
  tenant      SysTenant? @relation(fields: [tenantId], references: [id])

  @@index([jobId, startedAt])
  @@index([tenantId, startedAt])
  @@map("sys_job_log")
}

// ============================================================
//  代码生成器(平台级工具,不隔离租户)
// ============================================================

model GenTable {
  id            BigInt    @id @default(autoincrement())
  tableName     String    @map("table_name") @db.VarChar(100)
  tableComment  String?   @map("table_comment") @db.VarChar(200)
  className     String    @map("class_name") @db.VarChar(100)    // PascalCase,如 Order
  moduleName    String    @map("module_name") @db.VarChar(50)    // 业务模块名,如 biz
  businessName  String    @map("business_name") @db.VarChar(50)  // 业务名,如 order
  functionName  String    @map("function_name") @db.VarChar(100) // 显示名,如 订单管理
  packageName   String?   @map("package_name") @db.VarChar(100)  // 输出路径,如 modules/biz
  tplCategory   String    @default("crud") @map("tpl_category") @db.VarChar(50) // crud / tree
  parentMenuId  BigInt?   @map("parent_menu_id")
  options       String?   @db.Text                                // JSON 选项
  author        String    @db.VarChar(50)
  remark        String?   @db.VarChar(500)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     BigInt?   @map("created_by")

  fields        GenTableField[]

  @@unique([tableName])
  @@index([businessName])
  @@map("gen_table")
}

model GenTableField {
  id            BigInt    @id @default(autoincrement())
  tableId       BigInt    @map("table_id")
  columnName    String    @map("column_name") @db.VarChar(100)
  columnComment String?   @map("column_comment") @db.VarChar(200)
  columnType    String    @map("column_type") @db.VarChar(50)    // varchar(50)
  tsType        String?   @map("ts_type") @db.VarChar(50)        // string/number/boolean/Date
  fieldName     String    @map("field_name") @db.VarChar(100)    // camelCase
  isPk          Int       @default(0) @map("is_pk")
  isIncrement   Int       @default(0) @map("is_increment")
  isRequired    Int       @default(0) @map("is_required")
  isInsert      Int       @default(1) @map("is_insert")
  isEdit        Int       @default(1) @map("is_edit")
  isList        Int       @default(1) @map("is_list")
  isQuery       Int       @default(0) @map("is_query")
  queryType     String?   @map("query_type") @db.VarChar(50)     // = / like / between / in
  htmlType      String?   @map("html_type") @db.VarChar(50)      // input / textarea / select / radio / datetime / upload
  dictType      String?   @map("dict_type") @db.VarChar(50)
  sort          Int       @default(0)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  table         GenTable  @relation(fields: [tableId], references: [id], onDelete: Cascade)

  @@index([tableId, sort])
  @@map("gen_table_field")
}

// ============================================================
//  关联中间表
// ============================================================

model SysUserRole {
  userId    BigInt   @map("user_id")
  roleId    BigInt   @map("role_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      SysUser  @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      SysRole  @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@index([roleId])
  @@map("sys_user_role")
}

model SysUserPost {
  userId    BigInt   @map("user_id")
  postId    BigInt   @map("post_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      SysUser  @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      SysPost  @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@id([userId, postId])
  @@index([postId])
  @@map("sys_user_post")
}

model SysRoleMenu {
  roleId    BigInt   @map("role_id")
  menuId    BigInt   @map("menu_id")
  createdAt DateTime @default(now()) @map("created_at")

  role      SysRole  @relation(fields: [roleId], references: [id], onDelete: Cascade)
  menu      SysMenu  @relation(fields: [menuId], references: [id], onDelete: Cascade)

  @@id([roleId, menuId])
  @@index([menuId])
  @@map("sys_role_menu")
}

model SysRoleDept {
  roleId    BigInt   @map("role_id")
  deptId    BigInt   @map("dept_id")
  createdAt DateTime @default(now()) @map("created_at")

  role      SysRole  @relation(fields: [roleId], references: [id], onDelete: Cascade)
  dept      SysDept  @relation(fields: [deptId], references: [id], onDelete: Cascade)

  @@id([roleId, deptId])
  @@index([deptId])
  @@map("sys_role_dept")
}
```

---

## 5. 关键字段对照表(老 → 新)

### SysUser

| 老字段 | 新字段 | 备注 |
| --- | --- | --- |
| `createTime` | `createdAt` | 字段名 + 列名同步改 |
| `updateTime` | `updatedAt` | |
| `deleteTime` | `deletedAt` | |
| `isDelete` (Int) | 删除 | 改用 `deletedAt is not null` 表达 |
| `postIds` (String JSON) | 删除 | 改用 `SysUserPost` 中间表 |
| `userRoles` (隐式 m2m) | `userRoles: SysUserRole[]` | 显式中间表,便于附加 createdBy 等 |

### SysRole

| 老字段 | 新字段 | 备注 |
| --- | --- | --- |
| `menuIds` (String JSON) | 删除 | 改用 `SysRoleMenu` |
| `deptIds` (String JSON) | 删除 | 改用 `SysRoleDept`(仅 dataScope=5 时填充) |
| 不存在 | `tenantId` | 平台级角色为 null |
| 不存在 | `sort` | 角色排序 |

### SysMenu

| 老字段 | 新字段 | 备注 |
| --- | --- | --- |
| `external` (`@map is_external`) | `isExternal` (`@map is_external`) | 字段名规范化 |
| `keepAlive` | `isCache` (`@map is_cache`) | 与 RuoYi 习惯一致,前端 keep-alive 解析 |
| `show` (`@map is_show`) | `isVisible` (`@map is_visible`) | |
| 不存在 | `i18nKey` | 国际化菜单 key |
| 不存在 | `query` | 路由 query 参数(预留) |

### SysJob

| 老字段 | 新字段 | 备注 |
| --- | --- | --- |
| `handler` | `invokeTarget` | 改为 `beanName.method('arg')` 形式,与 RuoYi 习惯一致 |
| `cron` | `cronExpression` | |
| `interval` | 删除 | 统一用 cron 表达式;秒级请用 `* * * * * ?`(quartz 风格,需评估)或保留 5 段标准 |
| 不存在 | `misfirePolicy` / `concurrent` / `nextFireAt` / `prevFireAt` | |

> **cron 表达式选型**:S7 任务卡 `T-701` 必须明确:本系统**统一使用 node-cron 标准 5 段语法**(分 时 日 月 周),由 `cron-parser` 校验,不支持秒级精度。RuoYi 的 6/7 段 quartz 语法与 node 生态不兼容,**禁止照搬**。如未来确实需要秒级,再单独评估 `bullmq` / `agenda` 接入。

---

## 6. 多租户中间件白名单

`apps/backend/src/common/prisma/tenant.middleware.ts` 维护两个集合:

```ts
/** 租户感知模型,中间件会自动注入 tenantId 过滤与赋值 */
export const TENANT_AWARE_MODELS = new Set<string>([
  'SysUser',
  'SysRole',
  'SysDept',
  'SysPost',
  'SysNotice',
  'SysFile',
  'SysLoginLog',
  'SysOperLog',
  'SysJob',
  'SysJobLog',
  // 业务表由代码生成器添加:S6 生成代码时,模板自动把 model 名加入此集合
]);

/** 平台共享模型,跨租户可见,中间件不注入 tenantId */
export const PLATFORM_SHARED_MODELS = new Set<string>([
  'SysMenu',
  'SysDictType',
  'SysDictData',
  'SysConfig',
  'SysTenant',
  'GenTable',
  'GenTableField',
]);
```

中间件逻辑(伪代码):

```ts
prisma.$use(async (params, next) => {
  const ctx = requestContext.getStore();
  if (!ctx?.user) return next(params);                  // 后台脚本/seed 等无上下文场景
  if (ctx.user.isPlatformAdmin) return next(params);    // 平台超管不限制
  if (!params.model || !TENANT_AWARE_MODELS.has(params.model)) return next(params);

  const tid = ctx.user.tenantId;
  switch (params.action) {
    case 'findUnique':
    case 'findFirst':
    case 'findMany':
    case 'count':
    case 'aggregate':
    case 'groupBy':
      params.args ??= {};
      params.args.where = { AND: [params.args.where ?? {}, { tenantId: tid }] };
      break;
    case 'create':
      params.args.data = { ...params.args.data, tenantId: tid };
      break;
    case 'createMany':
      params.args.data = (params.args.data as any[]).map((d) => ({ ...d, tenantId: tid }));
      break;
    case 'update':
    case 'updateMany':
    case 'delete':
    case 'deleteMany':
      params.args.where = { AND: [params.args.where ?? {}, { tenantId: tid }] };
      break;
    case 'upsert':
      params.args.where = { AND: [params.args.where ?? {}, { tenantId: tid }] };
      params.args.create = { ...params.args.create, tenantId: tid };
      break;
  }
  return next(params);
});
```

> ⚠️ Prisma 5 中 `findUnique` 的 `where` 必须是唯一约束,直接 AND 注入会报错。**对策**:在 service 层避免使用 `findUnique`,统一用 `findFirst`/`findFirstOrThrow`。03 文档 T-303 会明确执行此改造。

---

## 7. dataScope 数据权限实现

### 7.1 枚举

```ts
// apps/backend/src/common/enums/data-scope.enum.ts
export enum DataScope {
  All = 1,                 // 全部数据
  Custom = 2,              // 自定义部门(由 sys_role_dept 决定)
  DeptAndChildren = 3,     // 本部门及以下
  Dept = 4,                // 仅本部门
  Self = 5,                // 仅本人
}
```

> 与 RuoYi 编号一致,便于参考实现和 SQL 习惯。

### 7.2 装饰器

```ts
// apps/backend/src/common/decorators/data-scope.decorator.ts
export interface DataScopeOptions {
  /** 所查询主表的 dept 字段路径,如 'deptId' 或关联字段 */
  deptField?: string;
  /** 所查询主表的 user 字段路径 */
  userField?: string;
}
export const DATA_SCOPE_KEY = 'dataScope';
export const DataScope = (opts: DataScopeOptions = {}) => SetMetadata(DATA_SCOPE_KEY, opts);
```

### 7.3 在 service 层用工具函数拼接 where

```ts
// apps/backend/src/common/utils/data-scope.util.ts
export async function buildDataScopeWhere(
  user: RequestUser,
  opts: DataScopeOptions,
  prisma: PrismaService,
): Promise<Prisma.SysUserWhereInput | null> {
  switch (user.dataScope) {
    case DataScope.All: return null;
    case DataScope.Self:
      return { [opts.userField ?? 'id']: user.userId };
    case DataScope.Dept:
      return { [opts.deptField ?? 'deptId']: user.deptId ?? -1 };
    case DataScope.DeptAndChildren: {
      const deptIds = await getDeptAndChildren(prisma, user.deptId);
      return { [opts.deptField ?? 'deptId']: { in: deptIds } };
    }
    case DataScope.Custom: {
      const customDeptIds = await prisma.sysRoleDept.findMany({
        where: { roleId: { in: user.roleIds } },
        select: { deptId: true },
      }).then((r) => r.map((x) => x.deptId));
      return { [opts.deptField ?? 'deptId']: { in: customDeptIds } };
    }
  }
}
```

> 用户拥有多个角色时,取**最宽**的 dataScope(`All` > `Custom` > `DeptAndChildren` > `Dept` > `Self`)。计算逻辑放在 JwtStrategy 加载用户信息时一次性完成,挂在 `RequestUser.dataScope`。

### 7.4 在哪些 service 接入?

S3 阶段接入的核心列表查询(`T-310`):

- `SysUserService.findPage`
- `SysOperLogService.findPage`
- `SysLoginLogService.findPage`
- `SysFileService.findPage`(可选,文件管理一般无需 dept 范围,但保留 scope=Self 能力)
- 由代码生成器生成的业务 service:模板默认接入 `DataScope.Self / Dept / DeptAndChildren`

---

## 8. 迁移与 seed 流程

### 8.1 首次迁移

S2 任务卡 `T-201`:

```bash
# 仓库根
pnpm --filter backend prisma:migrate:dev --name init
# 等价于
cd apps/backend && npx prisma migrate dev --name init
```

执行结果:
- 生成 `apps/backend/prisma/migrations/<ts>_init/migration.sql`
- 该文件**纳入 git**,作为后续所有迁移的基线
- 自动跑 `prisma generate`
- 自动跑 `prisma db seed`(需在 `package.json` 配置 `prisma.seed`)

### 8.2 后续迁移

每次 `schema.prisma` 改动:

```bash
pnpm prisma:migrate --name <kebab-case-desc>
# 例如:
pnpm prisma:migrate --name add-sys-tenant-package-code
```

迁移命名规则:`<动词>-<对象>-<修饰>`,如 `add-sys-user-tenant-id`、`drop-sys-job-interval`、`rename-keep-alive-to-is-cache`。

### 8.3 生产部署

```bash
pnpm --filter backend prisma:migrate:deploy
```

仅应用未执行的迁移,不修改 schema.prisma。

### 8.4 重置(仅本地/CI 测试)

```bash
pnpm db:reset
# 等价于:
# 1. drop database nest_admin_pro
# 2. create database nest_admin_pro
# 3. prisma migrate deploy
# 4. prisma db seed
```

`db:reset` 实现见 `06-infra.md` § scripts。

---

## 9. Seed 脚本结构

`apps/backend/prisma/seed.ts`(替换 `scripts/seed.sql`):

```text
apps/backend/prisma/
├── schema.prisma
├── migrations/
└── seed.ts                   # 入口
└── seed/
    ├── tenant.ts             # 默认平台租户 + 测试租户
    ├── menu.ts               # 全量菜单 + perms key(见 §10)
    ├── dict.ts               # 字典类型与字典数据
    ├── config.ts             # 系统配置
    ├── dept.ts               # 默认部门树
    ├── post.ts               # 默认岗位
    ├── role.ts               # 平台超管 / 租户管理员 / 普通用户
    ├── user.ts               # admin / tenantAdmin / user
    └── notice.ts             # 示例公告
```

`package.json` 配置:

```json
{
  "prisma": {
    "seed": "ts-node --transpile-only prisma/seed.ts"
  }
}
```

`seed.ts` 主流程:

```ts
import { PrismaClient } from '@prisma/client';
import { seedTenant } from './seed/tenant';
import { seedMenu } from './seed/menu';
// ...
const prisma = new PrismaClient();
async function main() {
  await seedTenant(prisma);
  await seedMenu(prisma);
  await seedDict(prisma);
  await seedConfig(prisma);
  await seedDept(prisma);
  await seedPost(prisma);
  await seedRole(prisma);
  await seedUser(prisma);
  await seedNotice(prisma);
}
main().finally(() => prisma.$disconnect());
```

**幂等策略**:每个 seed 文件用 `upsert` 而非 `create`,以 `code` / `key` / 业务唯一字段为 unique target。

---

## 10. 初始数据规划

### 10.1 默认租户

```ts
// 平台默认租户
{ id: 1n, code: 'platform', name: '平台总部', maxUsers: 9999, status: 1 }
// 演示租户
{ id: 2n, code: 'demo', name: '演示租户', maxUsers: 50, status: 1 }
```

### 10.2 默认用户

| username | password | tenantId | isPlatformAdmin | 角色 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `admin` | `admin123` | 1 | 1 | `platform_admin` | 平台超管 |
| `tenantadmin` | `admin123` | 2 | 0 | `tenant_admin` | 演示租户管理员 |
| `user` | `admin123` | 2 | 0 | `common` | 演示租户普通用户 |

密码统一 `bcrypt.hashSync('admin123', 10)`。

### 10.3 默认角色

| code | tenantId | dataScope | 包含菜单 | 说明 |
| --- | --- | --- | --- | --- |
| `platform_admin` | null | All | 全部菜单 + 租户管理 + 代码生成器 | 平台超管,跨租户 |
| `tenant_admin` | 2 | All | 系统管理 + 监控(不含租户管理/代码生成器) | 租户管理员 |
| `common` | 2 | Self | 仪表盘 + 个人中心 + 通知公告 | 普通用户 |

### 10.4 默认部门树

```text
1 平台总部 (tenantId=1)
2 演示总公司 (tenantId=2)
├─ 21 技术部 (tenantId=2, parentId=2)
│  ├─ 211 前端组
│  └─ 212 后端组
├─ 22 产品部
└─ 23 运营部
```

`ancestors` 字段对应 `0` / `0,2` / `0,2,21` 等。

### 10.5 默认岗位

每个租户内默认:`总经理 ceo` / `技术总监 cto` / `产品经理 pm` / `开发工程师 dev` / `运营 ops`。

### 10.6 默认菜单(完整 perms key 清单)

> 这是 `02-data-model.md` 最重要的一节,也是 04 文档前端 v-perm 的依据。Codex 在 seed 时必须**完整生成**下表所有菜单。

```text
1   仪表盘                  type=2  path=/dashboard         component=dashboard/index    icon=odometer    perms=             i18nKey=menu.dashboard
2   系统管理                type=1  path=/system            component=Layout            icon=setting     perms=             i18nKey=menu.system
2.1   用户管理              type=2  path=user             component=system/user/index   perms=system:user:list                i18nKey=menu.system.user
2.1.1   用户查询            type=3                                                       perms=system:user:query
2.1.2   用户新增            type=3                                                       perms=system:user:add
2.1.3   用户修改            type=3                                                       perms=system:user:edit
2.1.4   用户删除            type=3                                                       perms=system:user:remove
2.1.5   用户导入            type=3                                                       perms=system:user:import
2.1.6   用户导出            type=3                                                       perms=system:user:export
2.1.7   重置密码            type=3                                                       perms=system:user:resetPwd
2.1.8   分配角色            type=3                                                       perms=system:user:assignRole
2.2   角色管理              type=2  path=role             component=system/role/index   perms=system:role:list                i18nKey=menu.system.role
2.2.1   角色查询            type=3                                                       perms=system:role:query
2.2.2   角色新增            type=3                                                       perms=system:role:add
2.2.3   角色修改            type=3                                                       perms=system:role:edit
2.2.4   角色删除            type=3                                                       perms=system:role:remove
2.2.5   分配菜单            type=3                                                       perms=system:role:assignMenu
2.2.6   设置数据范围        type=3                                                       perms=system:role:setDataScope
2.3   部门管理              type=2  path=dept             component=system/dept/index   perms=system:dept:list                i18nKey=menu.system.dept
2.3.1-4 dept query/add/edit/remove                                                       perms=system:dept:{action}
2.4   岗位管理              type=2  path=post             component=system/post/index   perms=system:post:list                i18nKey=menu.system.post
2.4.1-4 post query/add/edit/remove                                                       perms=system:post:{action}
2.5   菜单管理              type=2  path=menu             component=system/menu/index   perms=system:menu:list                i18nKey=menu.system.menu
2.5.1-4 menu query/add/edit/remove                                                       perms=system:menu:{action}
2.6   字典管理              type=2  path=dict             component=system/dict/index   perms=system:dict:list                i18nKey=menu.system.dict
2.6.1-4 dict type query/add/edit/remove                                                  perms=system:dict:{action}
2.6.5-8 dict data query/add/edit/remove                                                  perms=system:dictData:{action}
2.7   参数管理              type=2  path=config           component=system/config/index perms=system:config:list              i18nKey=menu.system.config
2.7.1-5 config query/add/edit/remove/refresh                                             perms=system:config:{action}
2.8   通知公告              type=2  path=notice           component=system/notice/index perms=system:notice:list              i18nKey=menu.system.notice
2.8.1-5 notice query/add/edit/remove/publish                                             perms=system:notice:{action}
2.9   文件管理              type=2  path=file             component=system/file/index   perms=system:file:list                i18nKey=menu.system.file
2.9.1-3 file query/upload/remove                                                         perms=system:file:{action}
2.10  文件存储配置          type=2  path=file-config      component=system/file-config/index perms=system:fileConfig:list      i18nKey=menu.system.fileConfig
2.10.1-2 fileConfig query/edit                                                           perms=system:fileConfig:{action}
2.11  租户管理              type=2  path=tenant           component=system/tenant/index perms=system:tenant:list              i18nKey=menu.system.tenant
2.11.1-5 tenant query/add/edit/remove/switch                                             perms=system:tenant:{action}
3   系统监控                type=1  path=/monitor          component=Layout            icon=monitor                            i18nKey=menu.monitor
3.1   登录日志              type=2  path=login-log        component=monitor/login-log/index perms=monitor:loginLog:list       i18nKey=menu.monitor.loginLog
3.1.1-3 query / remove / clean                                                            perms=monitor:loginLog:{action}
3.2   操作日志              type=2  path=oper-log         component=monitor/oper-log/index  perms=monitor:operLog:list        i18nKey=menu.monitor.operLog
3.2.1-3 query / remove / clean                                                            perms=monitor:operLog:{action}
3.3   在线用户              type=2  path=online           component=monitor/online/index    perms=monitor:online:list         i18nKey=menu.monitor.online
3.3.1   forceLogout                                                                       perms=monitor:online:forceLogout
3.4   服务监控              type=2  path=server           component=monitor/server/index    perms=monitor:server:view         i18nKey=menu.monitor.server
3.5   缓存监控              type=2  path=cache            component=monitor/cache/index     perms=monitor:cache:view          i18nKey=menu.monitor.cache
3.5.1-3 query / clear / clearAll                                                          perms=monitor:cache:{action}
4   定时任务                type=1  path=/job              component=Layout            icon=timer                              i18nKey=menu.job
4.1   任务管理              type=2  path=index            component=job/index/index     perms=monitor:job:list                i18nKey=menu.job.index
4.1.1-7 query/add/edit/remove/dispatch/pause/resume                                       perms=monitor:job:{action}
4.2   执行日志              type=2  path=log              component=job/log/index       perms=monitor:job:log                 i18nKey=menu.job.log
5   代码生成器              type=1  path=/tool             component=Layout            icon=tools                              i18nKey=menu.tool
5.1   代码生成              type=2  path=gen              component=tool/gen/index      perms=tool:gen:list                   i18nKey=menu.tool.gen
5.1.1-7 import/edit/remove/preview/genCode/syncDb/download                                perms=tool:gen:{action}
6   个人中心                type=2  path=/profile          component=profile/index     icon=user           perms=             visible=0  (隐藏菜单,所有人可见)
```

> Codex 在 `prisma/seed/menu.ts` 中以**结构化数据**(数组 + 嵌套)生成,不要逐条 SQL。完整菜单数量约 **80 条**。

### 10.7 默认字典

```ts
const dicts = [
  { code: 'sys_normal_disable',  name: '系统状态',      items: [['正常','1','success'], ['停用','0','danger']] },
  { code: 'sys_user_sex',        name: '用户性别',      items: [['未知','0',''], ['男','1','primary'], ['女','2','danger']] },
  { code: 'sys_yes_no',          name: '系统是否',      items: [['是','1','success'], ['否','0','info']] },
  { code: 'sys_notice_type',     name: '通知类型',      items: [['通知','1','primary'], ['公告','2','warning']] },
  { code: 'sys_notice_status',   name: '通知状态',      items: [['草稿','0','info'], ['已发布','1','success'], ['已撤回','2','danger']] },
  { code: 'sys_oper_type',       name: '操作类型',      items: [['新增','1','success'], ['修改','2','primary'], ['删除','3','danger'], ['查询','4','info'], ['导出','5','warning'], ['导入','6','warning'], ['其他','9','info']] },
  { code: 'sys_login_status',    name: '登录状态',      items: [['成功','1','success'], ['失败','0','danger']] },
  { code: 'sys_job_status',      name: '任务状态',      items: [['暂停','0','info'], ['启用','1','success']] },
  { code: 'sys_job_misfire',     name: '任务策略',      items: [['立即执行','1','primary'], ['执行一次','2','warning'], ['放弃','3','info']] },
  { code: 'sys_data_scope',      name: '数据范围',      items: [['全部','1',''], ['自定义','2',''], ['本部门及以下','3',''], ['本部门','4',''], ['仅本人','5','']] },
  { code: 'sys_menu_type',       name: '菜单类型',      items: [['目录','1',''], ['菜单','2',''], ['按钮','3','']] },
];
```

### 10.8 默认 SysConfig

| key | value | type | builtin | 说明 |
| --- | --- | --- | --- | --- |
| `sys.app.name` | `Nest-Admin-Pro` | string | 1 | 系统名称 |
| `sys.app.logo` | `/file/system/logo.png` | string | 1 | Logo 路径 |
| `sys.app.copyright` | `© 2026 Nest-Admin-Pro` | string | 1 | 版权 |
| `sys.captcha.enabled` | `true` | boolean | 1 | 验证码开关 |
| `sys.user.initPassword` | `admin123` | string | 1 | 用户重置密码默认值 |
| `sys.account.lockMinutes` | `30` | number | 1 | 账号锁定分钟数 |
| `sys.account.maxRetryCount` | `5` | number | 1 | 登录失败上限 |
| `sys.file.allowedImageExt` | `["jpg","jpeg","png","gif","webp"]` | json | 1 | 图片白名单扩展名 |
| `sys.file.allowedFileExt` | `["jpg","jpeg","png","pdf","doc","docx","xls","xlsx","ppt","pptx","txt","zip"]` | json | 1 | 文件白名单扩展名 |
| `file.storage` | `local` | string | 0 | 当前存储驱动 |
| `file.cloud.region` | `` | string | 0 | 云存储区域 |
| ... | ... | ... | ... | 其他云存储配置(配合 FILE_STORAGE)|

---

## 11. BigInt 序列化策略

Prisma 的 `BigInt` 主键在 JSON 序列化时会抛 `Do not know how to serialize a BigInt`。**禁止**用 `(BigInt.prototype as any).toJSON = ...` 全局污染(当前 `auth.service.ts:17` 的写法)。

**正确方案**(S0 任务卡 `T-005`):

1. 全局响应通过 `TransformInterceptor` 处理:
   ```ts
   import { stringifyBigInt } from './bigint.util';
   return next.handle().pipe(map(data => stringifyBigInt(data)));
   ```
   `stringifyBigInt` 递归把 `bigint` 转为 string。
2. 前端响应类型用 `string | number`,在表格展示时不解析回 BigInt(JS Number 安全范围 2^53 内,自增主键溢出概率极低,除非超大表)。
3. 业务计算需 BigInt 的场景**仅限后端**,前端始终用 string。

---

## 12. S2 任务卡索引

S2 阶段产出的任务卡分两批:**T-200~T-212** 集中管理 schema 与 seed,本文档负责;**T-220~T-222** 是后端 service 层适配,在 03 文档 § S2 落地。

> ⚠️ 任务卡 T-200~T-212 没有以 `### T-XXX` 标题独立列出,而是在本文档前述各节(§ 4 / § 6 / § 7 / § 8 / § 9 / § 10 / § 11)以**主题章节**形式提供完整内容。下表是 ID 与主题的映射:Codex 实施这些卡时**直接按主题章节执行**即可,commit 时带对应卡号。

| 卡 | 标题 | 文档 | 主体内容位置 |
| --- | --- | --- | --- |
| T-200 | 启用 prisma migrate,清空 db push 历史,准备首个 init 迁移 | 02 | § 8 |
| T-201 | 重写 schema.prisma:加 `@@map`、改字段名、补 `tenantId` | 02 | § 4 + § 5 |
| T-202 | 拆分 `SysUserRole / SysUserPost / SysRoleMenu / SysRoleDept` 中间表 | 02 | § 4 关联中间表段 |
| T-203 | `SysJob` 字段重整:`handler→invokeTarget`、补 misfire/concurrent 等 | 02 | § 4 SysJob + § 5 |
| T-204 | 新建 `prisma/seed.ts` 框架(含 8 个分文件) | 02 | § 9 |
| T-205 | 实现 `seed/menu.ts`(80 条菜单 + perms key) | 02 | § 10.6 |
| T-206 | 实现 `seed/dict.ts`(11 个字典类型 + 全部数据项) | 02 | § 10.7 |
| T-207 | 实现 `seed/config.ts`(11+ 系统参数) | 02 | § 10.8 |
| T-208 | 实现 `seed/{tenant,dept,post,role,user,notice}.ts` | 02 | § 10.1 ~ 10.5 |
| T-209 | 全量替换 `scripts/seed.sql`,删除该文件,改 `init-db.sh` 调 prisma | 02→06 | § 9 + 06 T-108 |
| T-210 | BigInt 序列化:`stringifyBigInt` 工具(已在 03 T-002 落地,本卡引用即可) | 02→03 | § 11 + 03 T-002 |
| T-211 | RequestContext (AsyncLocalStorage) + 多租户中间件骨架(空逻辑,真正生效在 S3) | 02→03 | § 6 + 03 T-130 |
| T-212 | 单测:中间件白名单 / dataScope 工具 / BigInt 序列化 | 02 | § 6 + § 7 + § 11 |
| T-220 | 改造所有 service 的字段名(createTime→createdAt 等) | 03 | T-220 |
| T-221 | 改造 Role/User 的角色/岗位/菜单/部门关联读写(改用中间表) | 03 | T-221 |
| T-222 | PrismaService 注入租户中间件骨架(空逻辑,S3 启用) | 03 | T-222 |

S2 完成门禁(00 文档):

- [x] `pnpm prisma:migrate:dev --name init` 成功
- [x] `pnpm prisma:seed` 幂等(重复跑不报错)
- [x] MySQL 表名为 snake_case
- [x] 默认 admin 登录依然能用(seed 出 admin 用户和角色)
- [x] 单元测试通过

---

完。下一份文档 `03-backend.md` 将给出 S0/S3/S4/S5/S6/S7 全部后端任务卡(估计 60+ 张)。
