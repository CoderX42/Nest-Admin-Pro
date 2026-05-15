# Nest-Admin-Pro 数据库初始化

## 快速开始

```bash
cd scripts

# 方式一：使用初始化脚本（自动）
chmod +x init-db.sh
./init-db.sh

# 方式二：手动执行
mysql -u root -p ruoyi_vue_plus < seed.sql
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| DB_HOST | localhost | MySQL 主机 |
| DB_PORT | 3306 | MySQL 端口 |
| DB_USER | root | 用户名 |
| DB_PASSWORD | (空) | 密码 |

示例：
```bash
DB_HOST=localhost DB_USER=root DB_PASSWORD=123456 ./init-db.sh
```

## 脚本说明

| 文件 | 说明 |
|------|------|
| `init-db.sh` | 一键初始化脚本（创建数据库 + 安装依赖 + 迁移 + 种子数据） |
| `seed.sql` | 完整的初始化数据（部门/岗位/用户/角色/菜单/字典/配置/公告） |

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 数据表清单

- `sys_user` - 用户表
- `sys_role` - 角色表
- `sys_dept` - 部门表
- `sys_post` - 岗位表
- `sys_menu` - 菜单表
- `sys_dict_type` - 字典类型
- `sys_dict_data` - 字典数据
- `sys_config` - 系统配置
- `sys_notice` - 通知公告
- `sys_login_log` - 登录日志
- `sys_oper_log` - 操作日志
- `sys_job` - 定时任务
- `sys_job_log` - 任务日志
- `gen_table` - 代码生成表
- `gen_table_field` - 代码生成字段
- `sys_tenant` - 租户表