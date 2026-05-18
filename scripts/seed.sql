-- ============================================
-- Nest-Admin-Pro 初始化种子数据
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- 按外键依赖顺序清空表（先删子表，再删父表）
DELETE FROM _SysRoleToSysUser;
DELETE FROM SysJobLog;
DELETE FROM SysJob;
DELETE FROM SysOperLog;
DELETE FROM SysLoginLog;
DELETE FROM SysNotice;
DELETE FROM SysConfig;
DELETE FROM SysDictData;
DELETE FROM SysDictType;
DELETE FROM SysMenu;
DELETE FROM SysPost;
DELETE FROM SysUser;
DELETE FROM SysRole;
DELETE FROM SysDept;
DELETE FROM SysTenant;
DELETE FROM GenTableField;
DELETE FROM GenTable;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. 初始化部门数据（先父后子，避免外键冲突）
-- ============================================
INSERT INTO SysDept (id, name, parentId, sort, status, createTime, updateTime) VALUES
(1, '总公司', 0, 0, 1, NOW(), NOW()),
(100, '技术部', 1, 1, 1, NOW(), NOW()),
(101, '产品部', 1, 2, 1, NOW(), NOW()),
(102, '运营部', 1, 3, 1, NOW(), NOW()),
(103, '财务部', 1, 4, 1, NOW(), NOW());

-- ============================================
-- 2. 初始化岗位数据
-- ============================================
INSERT INTO SysPost (id, name, code, sort, status, createTime, updateTime) VALUES
(1, '总经理', 'CEO', 1, 1, NOW(), NOW()),
(2, '技术总监', 'CTO', 2, 1, NOW(), NOW()),
(3, '开发工程师', 'DEV', 3, 1, NOW(), NOW()),
(4, '产品经理', 'PM', 4, 1, NOW(), NOW()),
(5, '运营专员', 'OPERATOR', 5, 1, NOW(), NOW()),
(6, '部门经理', 'MGR', 6, 1, NOW(), NOW()),
(7, '前端开发', 'FE', 7, 1, NOW(), NOW()),
(8, '后端开发', 'BE', 8, 1, NOW(), NOW()),
(9, '测试工程师', 'QA', 9, 1, NOW(), NOW()),
(10, 'UI设计师', 'UI', 10, 1, NOW(), NOW());

-- ============================================
-- 3. 初始化角色数据
-- ============================================
INSERT INTO SysRole (id, name, code, status, dataScope, menuIds, remark, createTime, updateTime) VALUES
(1, '超级管理员', 'SUPER_ADMIN', 1, 1, '[1,2,3,100,101,102,103,104,105,106,107,108,109,200,201,202,203,204,300,301,500,501,502,503,504,505,506,507,508]', '拥有所有权限', NOW(), NOW()),
(2, '普通角色', 'NORMAL_ROLE', 1, 2, '[]', '普通用户角色', NOW(), NOW());

-- ============================================
-- 4. 初始化用户数据 (密码: admin123 -> bcrypt)
-- ============================================
INSERT INTO SysUser (id, username, password, nickname, avatar, email, phone, status, deptId, postIds, createTime, updateTime) VALUES
(1, 'admin', '$2b$10$jYVLE.Fk/wmh38Ly5YfEp.oFHx9x5uz31evbveKG5wyGNCUgfj9DK', '管理员', '', 'admin@example.com', '13800138000', 1, 100, '[2,3]', NOW(), NOW()),
(2, 'user', '$2b$10$jYVLE.Fk/wmh38Ly5YfEp.oFHx9x5uz31evbveKG5wyGNCUgfj9DK', '测试用户', '', 'user@example.com', '13900139000', 1, 100, '[3]', NOW(), NOW());

-- 用户角色关联
INSERT INTO _SysRoleToSysUser (A, B) VALUES (1, 1), (2, 2);

-- ============================================
-- 5. 初始化菜单数据
-- ============================================
INSERT INTO SysMenu (id, name, type, parentId, path, component, icon, sort, perms, status, is_external, keepAlive, is_show, createTime, updateTime) VALUES
-- 一级菜单
(1, '系统管理', 1, 0, '/system', NULL, 'Setting', 1, '', 1, 0, 0, 1, NOW(), NOW()),
(2, '系统监控', 1, 0, '/monitor', NULL, 'Monitor', 2, '', 1, 0, 0, 1, NOW(), NOW()),
(3, '代码生成', 1, 0, '/gen', NULL, 'Code', 3, '', 1, 0, 0, 1, NOW(), NOW()),
-- 系统管理子菜单
(100, '用户管理', 2, 1, '/system/user', 'system/user/index', 'User', 1, 'system:user:list', 1, 0, 1, 1, NOW(), NOW()),
(101, '部门管理', 2, 1, '/system/dept', 'system/dept/index', 'Department', 2, 'system:dept:list', 1, 0, 1, 1, NOW(), NOW()),
(102, '岗位管理', 2, 1, '/system/post', 'system/post/index', 'Post', 3, 'system:post:list', 1, 0, 1, 1, NOW(), NOW()),
(103, '菜单管理', 2, 1, '/system/menu', 'system/menu/index', 'Menu', 4, 'system:menu:list', 1, 0, 1, 1, NOW(), NOW()),
(104, '角色管理', 2, 1, '/system/role', 'system/role/index', 'Role', 5, 'system:role:list', 1, 0, 1, 1, NOW(), NOW()),
(105, '字典管理', 2, 1, '/system/dict', 'system/dict/index', 'Dict', 6, 'system:dict:list', 1, 0, 1, 1, NOW(), NOW()),
(106, '参数管理', 2, 1, '/system/config', 'system/config/index', 'Config', 7, 'system:config:list', 1, 0, 1, 1, NOW(), NOW()),
(108, '文件配置', 2, 1, '/system/file-config', 'system/file-config/index', 'FolderOpened', 8, 'system:config:list', 1, 0, 1, 1, NOW(), NOW()),
(109, '文件管理', 2, 1, '/system/file', 'system/file/index', 'Files', 9, 'system:file:list', 1, 0, 1, 1, NOW(), NOW()),
(107, '通知公告', 2, 1, '/system/notice', 'system/notice/index', 'Notice', 10, 'system:notice:list', 1, 0, 1, 1, NOW(), NOW()),
-- 系统监控子菜单
(200, '登录日志', 2, 2, '/monitor/login-log', 'monitor/login-log/index', 'Log', 1, 'monitor:login:list', 1, 0, 1, 1, NOW(), NOW()),
(201, '操作日志', 2, 2, '/monitor/oper-log', 'monitor/oper-log/index', 'Operation', 2, 'monitor:oper:list', 1, 0, 1, 1, NOW(), NOW()),
(202, '在线用户', 2, 2, '/monitor/online', 'monitor/online/index', 'Online', 3, 'monitor:online:list', 1, 0, 1, 1, NOW(), NOW()),
(203, '服务监控', 2, 2, '/monitor/server', 'monitor/server/index', 'Server', 4, 'monitor:server:list', 1, 0, 1, 1, NOW(), NOW()),
(204, '缓存监控', 2, 2, '/monitor/cache', 'monitor/cache/index', 'Redis', 5, 'monitor:cache:list', 1, 0, 1, 1, NOW(), NOW()),
-- 代码生成子菜单
(300, '配置管理', 2, 3, '/gen/config', 'gen/config/index', 'Setup', 1, 'gen:config:list', 1, 0, 1, 1, NOW(), NOW()),
(301, '生成记录', 2, 3, '/gen/table', 'gen/table/index', 'Table', 2, 'gen:table:list', 1, 0, 1, 1, NOW(), NOW()),
-- 按钮级别的权限
(500, '用户查询', 3, 100, NULL, NULL, '', 1, 'system:user:query', 1, 0, 0, 1, NOW(), NOW()),
(501, '用户新增', 3, 100, NULL, NULL, '', 2, 'system:user:add', 1, 0, 0, 1, NOW(), NOW()),
(502, '用户编辑', 3, 100, NULL, NULL, '', 3, 'system:user:edit', 1, 0, 0, 1, NOW(), NOW()),
(503, '用户删除', 3, 100, NULL, NULL, '', 4, 'system:user:remove', 1, 0, 0, 1, NOW(), NOW()),
(504, '重置密码', 3, 100, NULL, NULL, '', 5, 'system:user:resetPwd', 1, 0, 0, 1, NOW(), NOW()),
(505, '导出数据', 3, 100, NULL, NULL, '', 6, 'system:user:export', 1, 0, 0, 1, NOW(), NOW()),
(506, '导入数据', 3, 100, NULL, NULL, '', 7, 'system:user:import', 1, 0, 0, 1, NOW(), NOW()),
(507, '文件查询', 3, 109, NULL, NULL, '', 1, 'system:file:list', 1, 0, 0, 1, NOW(), NOW()),
(508, '文件删除', 3, 109, NULL, NULL, '', 2, 'system:file:remove', 1, 0, 0, 1, NOW(), NOW());

-- ============================================
-- 6. 初始化字典数据
-- ============================================
INSERT INTO SysDictType (id, name, code, status, remark, createTime, updateTime) VALUES
(1, '用户状态', 'sys_user_status', 1, '用户状态字典', NOW(), NOW()),
(2, '菜单类型', 'sys_menu_type', 1, '菜单类型字典', NOW(), NOW()),
(3, '系统状态', 'sys_normal_disable', 1, '系统状态字典', NOW(), NOW()),
(4, '数据类型', 'sys_data_scope', 1, '数据权限范围', NOW(), NOW());

INSERT INTO SysDictData (dictTypeId, label, value, sort, status, createTime, updateTime) VALUES
-- 用户状态 (1)
(1, '正常', '1', 1, 1, NOW(), NOW()),
(1, '禁用', '0', 2, 1, NOW(), NOW()),
-- 菜单类型 (2)
(2, '目录', '1', 1, 1, NOW(), NOW()),
(2, '菜单', '2', 2, 1, NOW(), NOW()),
(2, '按钮', '3', 3, 1, NOW(), NOW()),
-- 系统状态 (3)
(3, '正常', '1', 1, 1, NOW(), NOW()),
(3, '禁用', '0', 2, 1, NOW(), NOW()),
-- 数据范围 (4)
(4, '全部数据', '1', 1, 1, NOW(), NOW()),
(4, '自定义数据', '2', 2, 1, NOW(), NOW()),
(4, '本部门数据', '3', 3, 1, NOW(), NOW()),
(4, '本部门及以下', '4', 4, 1, NOW(), NOW()),
(4, '仅本人数据', '5', 5, 1, NOW(), NOW());

-- ============================================
-- 7. 初始化系统配置
-- ============================================
INSERT INTO SysConfig (name, `key`, value, type, remark, status, createTime, updateTime) VALUES
('系统名称', 'sys_system_name', 'Nest-Admin-Pro', 'string', '系统名称', 1, NOW(), NOW()),
('系统Logo', 'sys_logo', '/logo.png', 'string', '系统Logo地址', 1, NOW(), NOW()),
('版权信息', 'sys_copyright', '© 2024 Nest-Admin-Pro', 'string', '版权信息', 1, NOW(), NOW()),
('登录验证码', 'sys_login_captcha', 'true', 'boolean', '是否开启登录验证码', 1, NOW(), NOW()),
('登录失败锁定', 'sys_login_locked', 'true', 'boolean', '是否启用登录失败锁定', 1, NOW(), NOW()),
('文件上传大小', 'sys_file_max_size', '10', 'number', '文件上传大小限制(MB)', 1, NOW(), NOW()),
('允许文件类型', 'sys_file_types', 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx', 'string', '允许上传的文件类型', 1, NOW(), NOW()),
('文件存储方式', 'file_storage', 'local', 'string', 'local / aliyun-oss / tencent-cos / qiniu-kodo / huawei-obs', 1, NOW(), NOW()),
('本地上传目录', 'file_upload_dir', './uploads', 'string', '本地文件上传目录', 1, NOW(), NOW()),
('图片上传大小', 'file_max_image_size', '2097152', 'number', '图片上传大小限制(字节)', 1, NOW(), NOW()),
('文件上传大小', 'file_max_file_size', '104857600', 'number', '文件上传大小限制(字节)', 1, NOW(), NOW()),
('对象存储 Region', 'file_cloud_region', '', 'string', '对象存储 Region/Zone', 1, NOW(), NOW()),
('对象存储 Bucket', 'file_cloud_bucket', '', 'string', '对象存储 Bucket', 1, NOW(), NOW()),
('对象存储 AccessKey ID', 'file_cloud_access_key_id', '', 'string', '对象存储 AccessKey ID/SecretId', 1, NOW(), NOW()),
('对象存储 AccessKey Secret', 'file_cloud_access_key_secret', '', 'string', '对象存储 AccessKey Secret/SecretKey', 1, NOW(), NOW()),
('对象存储 Endpoint', 'file_cloud_endpoint', '', 'string', '对象存储 Endpoint', 1, NOW(), NOW()),
('对象存储前缀', 'file_cloud_prefix', 'uploads', 'string', '对象存储对象前缀', 1, NOW(), NOW()),
('对象存储公开访问域名', 'file_cloud_public_url', '', 'string', '对象存储或 CDN 公开访问域名', 1, NOW(), NOW()),
('对象存储 HTTPS', 'file_cloud_secure', 'true', 'boolean', '对象存储上传是否使用 HTTPS', 1, NOW(), NOW()),
('OSS Region', 'file_oss_region', '', 'string', '阿里云 OSS Region', 1, NOW(), NOW()),
('OSS Bucket', 'file_oss_bucket', '', 'string', '阿里云 OSS Bucket', 1, NOW(), NOW()),
('OSS AccessKey ID', 'file_oss_access_key_id', '', 'string', '阿里云 OSS AccessKey ID', 1, NOW(), NOW()),
('OSS AccessKey Secret', 'file_oss_access_key_secret', '', 'string', '阿里云 OSS AccessKey Secret', 1, NOW(), NOW()),
('OSS Endpoint', 'file_oss_endpoint', '', 'string', '阿里云 OSS Endpoint', 1, NOW(), NOW()),
('OSS 对象前缀', 'file_oss_prefix', 'uploads', 'string', 'OSS 对象前缀', 1, NOW(), NOW()),
('OSS 公开访问域名', 'file_oss_public_url', '', 'string', 'OSS 或 CDN 公开访问域名', 1, NOW(), NOW()),
('OSS HTTPS', 'file_oss_secure', 'true', 'boolean', 'OSS 上传是否使用 HTTPS', 1, NOW(), NOW());

-- ============================================
-- 8. 初始化通知公告
-- ============================================
INSERT INTO SysNotice (title, content, type, status, publishTime, createTime, updateTime) VALUES
('欢迎使用 Nest-Admin-Pro', '欢迎使用 Nest-Admin-Pro 全栈开发框架，祝您使用愉快！', 1, 1, NOW(), NOW(), NOW()),
('系统升级通知', '系统将于本周日凌晨2:00-6:00进行升级维护，届时可能无法访问。', 2, 1, NOW(), NOW(), NOW());

-- ============================================
-- 9. 初始化租户数据
-- ============================================
INSERT INTO SysTenant (id, name, code, status, expireTime, maxUsers, remark, createTime, updateTime) VALUES
(1, '默认租户', 'default', 1, NULL, 100, '系统默认租户', NOW(), NOW());

-- ============================================
-- 完成
-- ============================================
SELECT '数据库初始化完成！' AS message;
SELECT '默认账号: admin, 密码: admin123' AS login_info;
