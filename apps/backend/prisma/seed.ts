import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const password = bcrypt.hashSync('admin123', 10);

type MenuSeed = {
  id: bigint;
  parentId?: bigint;
  name: string;
  type: number;
  path?: string;
  component?: string;
  icon?: string;
  perms?: string;
  i18nKey?: string;
  sort?: number;
  isVisible?: number;
};

const menuSeeds: MenuSeed[] = [
  { id: 1n, name: '仪表盘', type: 2, path: '/dashboard', component: 'dashboard/index', icon: 'odometer', i18nKey: 'menu.dashboard', sort: 1 },
  { id: 2n, name: '系统管理', type: 1, path: '/system', component: 'Layout', icon: 'setting', i18nKey: 'menu.system', sort: 2 },
  { id: 21n, parentId: 2n, name: '用户管理', type: 2, path: 'user', component: 'system/user/index', perms: 'system:user:list', i18nKey: 'menu.system.user', sort: 1 },
  { id: 22n, parentId: 2n, name: '角色管理', type: 2, path: 'role', component: 'system/role/index', perms: 'system:role:list', i18nKey: 'menu.system.role', sort: 2 },
  { id: 23n, parentId: 2n, name: '部门管理', type: 2, path: 'dept', component: 'system/dept/index', perms: 'system:dept:list', i18nKey: 'menu.system.dept', sort: 3 },
  { id: 24n, parentId: 2n, name: '岗位管理', type: 2, path: 'post', component: 'system/post/index', perms: 'system:post:list', i18nKey: 'menu.system.post', sort: 4 },
  { id: 25n, parentId: 2n, name: '菜单管理', type: 2, path: 'menu', component: 'system/menu/index', perms: 'system:menu:list', i18nKey: 'menu.system.menu', sort: 5 },
  { id: 26n, parentId: 2n, name: '字典管理', type: 2, path: 'dict', component: 'system/dict/index', perms: 'system:dict:list', i18nKey: 'menu.system.dict', sort: 6 },
  { id: 27n, parentId: 2n, name: '参数管理', type: 2, path: 'config', component: 'system/config/index', perms: 'system:config:list', i18nKey: 'menu.system.config', sort: 7 },
  { id: 28n, parentId: 2n, name: '通知公告', type: 2, path: 'notice', component: 'system/notice/index', perms: 'system:notice:list', i18nKey: 'menu.system.notice', sort: 8 },
  { id: 29n, parentId: 2n, name: '文件管理', type: 2, path: 'file', component: 'system/file/index', perms: 'system:file:list', i18nKey: 'menu.system.file', sort: 9 },
  { id: 210n, parentId: 2n, name: '文件存储配置', type: 2, path: 'file-config', component: 'system/file-config/index', perms: 'system:fileConfig:list', i18nKey: 'menu.system.fileConfig', sort: 10 },
  { id: 211n, parentId: 2n, name: '租户管理', type: 2, path: 'tenant', component: 'system/tenant/index', perms: 'system:tenant:list', i18nKey: 'menu.system.tenant', sort: 11 },
  { id: 3n, name: '系统监控', type: 1, path: '/monitor', component: 'Layout', icon: 'monitor', i18nKey: 'menu.monitor', sort: 3 },
  { id: 31n, parentId: 3n, name: '登录日志', type: 2, path: 'login-log', component: 'monitor/login-log/index', perms: 'monitor:loginLog:list', i18nKey: 'menu.monitor.loginLog', sort: 1 },
  { id: 32n, parentId: 3n, name: '操作日志', type: 2, path: 'oper-log', component: 'monitor/oper-log/index', perms: 'monitor:operLog:list', i18nKey: 'menu.monitor.operLog', sort: 2 },
  { id: 33n, parentId: 3n, name: '在线用户', type: 2, path: 'online', component: 'monitor/online/index', perms: 'monitor:online:list', i18nKey: 'menu.monitor.online', sort: 3 },
  { id: 34n, parentId: 3n, name: '服务监控', type: 2, path: 'server', component: 'monitor/server/index', perms: 'monitor:server:view', i18nKey: 'menu.monitor.server', sort: 4 },
  { id: 35n, parentId: 3n, name: '缓存监控', type: 2, path: 'cache', component: 'monitor/cache/index', perms: 'monitor:cache:view', i18nKey: 'menu.monitor.cache', sort: 5 },
  { id: 4n, name: '定时任务', type: 1, path: '/job', component: 'Layout', icon: 'timer', i18nKey: 'menu.job', sort: 4 },
  { id: 41n, parentId: 4n, name: '任务管理', type: 2, path: 'index', component: 'job/index/index', perms: 'monitor:job:list', i18nKey: 'menu.job.index', sort: 1 },
  { id: 42n, parentId: 4n, name: '执行日志', type: 2, path: 'log', component: 'job/log/index', perms: 'monitor:job:log', i18nKey: 'menu.job.log', sort: 2 },
  { id: 5n, name: '代码生成器', type: 1, path: '/tool', component: 'Layout', icon: 'tools', i18nKey: 'menu.tool', sort: 5 },
  { id: 51n, parentId: 5n, name: '代码生成', type: 2, path: 'gen', component: 'tool/gen/index', perms: 'tool:gen:list', i18nKey: 'menu.tool.gen', sort: 1 },
  { id: 6n, name: '个人中心', type: 2, path: '/profile', component: 'profile/index', icon: 'user', sort: 6, isVisible: 0 },
];

const buttonGroups = [
  [21n, '用户', 'system:user', ['query', 'add', 'edit', 'remove', 'import', 'export', 'resetPwd', 'assignRole']],
  [22n, '角色', 'system:role', ['query', 'add', 'edit', 'remove', 'assignMenu', 'setDataScope']],
  [23n, '部门', 'system:dept', ['query', 'add', 'edit', 'remove']],
  [24n, '岗位', 'system:post', ['query', 'add', 'edit', 'remove']],
  [25n, '菜单', 'system:menu', ['query', 'add', 'edit', 'remove']],
  [26n, '字典', 'system:dict', ['query', 'add', 'edit', 'remove']],
  [26n, '字典数据', 'system:dictData', ['query', 'add', 'edit', 'remove']],
  [27n, '参数', 'system:config', ['query', 'add', 'edit', 'remove', 'refresh']],
  [28n, '通知', 'system:notice', ['query', 'add', 'edit', 'remove', 'publish']],
  [29n, '文件', 'system:file', ['query', 'upload', 'remove']],
  [210n, '文件配置', 'system:fileConfig', ['query', 'edit']],
  [211n, '租户', 'system:tenant', ['query', 'add', 'edit', 'remove', 'switch']],
  [31n, '登录日志', 'monitor:loginLog', ['query', 'remove', 'clean']],
  [32n, '操作日志', 'monitor:operLog', ['query', 'remove', 'clean']],
  [33n, '在线用户', 'monitor:online', ['forceLogout']],
  [35n, '缓存', 'monitor:cache', ['query', 'clear', 'clearAll']],
  [41n, '任务', 'monitor:job', ['query', 'add', 'edit', 'remove', 'dispatch', 'pause', 'resume']],
  [51n, '代码生成', 'tool:gen', ['import', 'edit', 'remove', 'preview', 'genCode', 'syncDb', 'download']],
] as const;

let buttonId = 1000n;
for (const [parentId, label, prefix, actions] of buttonGroups) {
  actions.forEach((action, index) => {
    menuSeeds.push({
      id: buttonId++,
      parentId,
      name: label + action,
      type: 3,
      perms: prefix + ':' + action,
      sort: index + 1,
    });
  });
}

const dicts = [
  { code: 'sys_normal_disable', name: '系统状态', items: [['正常', '1', 'success'], ['停用', '0', 'danger']] },
  { code: 'sys_user_sex', name: '用户性别', items: [['未知', '0', ''], ['男', '1', 'primary'], ['女', '2', 'danger']] },
  { code: 'sys_yes_no', name: '系统是否', items: [['是', '1', 'success'], ['否', '0', 'info']] },
  { code: 'sys_notice_type', name: '通知类型', items: [['通知', '1', 'primary'], ['公告', '2', 'warning']] },
  { code: 'sys_notice_status', name: '通知状态', items: [['草稿', '0', 'info'], ['已发布', '1', 'success'], ['已撤回', '2', 'danger']] },
  { code: 'sys_oper_type', name: '操作类型', items: [['新增', '1', 'success'], ['修改', '2', 'primary'], ['删除', '3', 'danger'], ['查询', '4', 'info'], ['导出', '5', 'warning'], ['导入', '6', 'warning'], ['其他', '9', 'info']] },
  { code: 'sys_login_status', name: '登录状态', items: [['成功', '1', 'success'], ['失败', '0', 'danger']] },
  { code: 'sys_job_status', name: '任务状态', items: [['暂停', '0', 'info'], ['启用', '1', 'success']] },
  { code: 'sys_job_misfire', name: '任务策略', items: [['立即执行', '1', 'primary'], ['执行一次', '2', 'warning'], ['放弃', '3', 'info']] },
  { code: 'sys_data_scope', name: '数据范围', items: [['全部', '1', ''], ['自定义', '2', ''], ['本部门及以下', '3', ''], ['本部门', '4', ''], ['仅本人', '5', '']] },
  { code: 'sys_menu_type', name: '菜单类型', items: [['目录', '1', ''], ['菜单', '2', ''], ['按钮', '3', '']] },
];

const configs: Array<[string, string, string, number, string]> = [
  ['sys.app.name', 'Nest-Admin-Pro', 'string', 1, '系统名称'],
  ['sys.app.logo', '/file/system/logo.png', 'string', 1, 'Logo 路径'],
  ['sys.app.copyright', '© 2026 Nest-Admin-Pro', 'string', 1, '版权'],
  ['sys.captcha.enabled', 'true', 'boolean', 1, '验证码开关'],
  ['sys.user.initPassword', 'admin123', 'string', 1, '用户重置密码默认值'],
  ['sys.account.lockMinutes', '30', 'number', 1, '账号锁定分钟数'],
  ['sys.account.maxRetryCount', '5', 'number', 1, '登录失败上限'],
  ['sys.file.allowedImageExt', '["jpg","jpeg","png","gif","webp"]', 'json', 1, '图片白名单扩展名'],
  ['sys.file.allowedFileExt', '["jpg","jpeg","png","pdf","doc","docx","xls","xlsx","ppt","pptx","txt","zip"]', 'json', 1, '文件白名单扩展名'],
  ['file.storage', 'local', 'string', 0, '当前存储驱动'],
  ['file.cloud.region', '', 'string', 0, '云存储区域'],
];

async function seedTenants() {
  await prisma.sysTenant.upsert({
    where: { code: 'platform' },
    update: { name: '平台总部', maxUsers: 9999, status: 1 },
    create: { id: 1n, code: 'platform', name: '平台总部', maxUsers: 9999, status: 1 },
  });
  await prisma.sysTenant.upsert({
    where: { code: 'demo' },
    update: { name: '演示租户', maxUsers: 50, status: 1 },
    create: { id: 2n, code: 'demo', name: '演示租户', maxUsers: 50, status: 1 },
  });
}

async function seedDepartments() {
  await ensureZeroIdRootRows();
  const depts = [
    { id: 1n, tenantId: 1n, parentId: 0n, ancestors: '0', name: '平台总部', sort: 1 },
    { id: 2n, tenantId: 2n, parentId: 0n, ancestors: '0', name: '演示总公司', sort: 1 },
    { id: 21n, tenantId: 2n, parentId: 2n, ancestors: '0,2', name: '技术部', sort: 1 },
    { id: 211n, tenantId: 2n, parentId: 21n, ancestors: '0,2,21', name: '前端组', sort: 1 },
    { id: 212n, tenantId: 2n, parentId: 21n, ancestors: '0,2,21', name: '后端组', sort: 2 },
    { id: 22n, tenantId: 2n, parentId: 2n, ancestors: '0,2', name: '产品部', sort: 2 },
    { id: 23n, tenantId: 2n, parentId: 2n, ancestors: '0,2', name: '运营部', sort: 3 },
  ];
  for (const dept of depts) {
    await prisma.sysDept.upsert({ where: { id: dept.id }, update: dept, create: dept });
  }
}

async function seedPosts() {
  const posts = [
    ['ceo', '总经理'], ['cto', '技术总监'], ['pm', '产品经理'], ['dev', '开发工程师'], ['ops', '运营'],
  ];
  let id = 1n;
  for (const tenantId of [1n, 2n]) {
    for (let index = 0; index < posts.length; index += 1) {
      const [code, name] = posts[index];
      await prisma.sysPost.upsert({
        where: { id },
        update: { tenantId, code, name, sort: index + 1, status: 1 },
        create: { id, tenantId, code, name, sort: index + 1, status: 1 },
      });
      id += 1n;
    }
  }
}

async function seedMenus() {
  await ensureZeroIdRootRows();
  for (const menu of menuSeeds) {
    await prisma.sysMenu.upsert({
      where: { id: menu.id },
      update: {
        parentId: menu.parentId ?? 0n,
        name: menu.name,
        type: menu.type,
        path: menu.path ?? null,
        component: menu.component ?? null,
        icon: menu.icon ?? null,
        perms: menu.perms ?? null,
        i18nKey: menu.i18nKey ?? null,
        sort: menu.sort ?? 0,
        isVisible: menu.isVisible ?? 1,
        status: 1,
      },
      create: {
        id: menu.id,
        parentId: menu.parentId ?? 0n,
        name: menu.name,
        type: menu.type,
        path: menu.path ?? null,
        component: menu.component ?? null,
        icon: menu.icon ?? null,
        perms: menu.perms ?? null,
        i18nKey: menu.i18nKey ?? null,
        sort: menu.sort ?? 0,
        isVisible: menu.isVisible ?? 1,
        status: 1,
      },
    });
  }
}

async function ensureZeroIdRootRows() {
  await prisma.$executeRawUnsafe("SET SESSION sql_mode = CONCAT(@@sql_mode, ',NO_AUTO_VALUE_ON_ZERO')");
  await prisma.$executeRawUnsafe(`
    INSERT INTO sys_dept (id, tenant_id, parent_id, ancestors, name, sort, status, created_at, updated_at)
    VALUES (0, NULL, 0, '0', '__root__', 0, 0, NOW(), NOW())
    ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status)
  `);
  await prisma.$executeRawUnsafe(`
    INSERT INTO sys_menu (id, parent_id, name, type, sort, status, is_visible, created_at, updated_at)
    VALUES (0, 0, '__root__', 1, 0, 0, 0, NOW(), NOW())
    ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status)
  `);
}

async function seedDicts() {
  for (const dict of dicts) {
    const type = await prisma.sysDictType.upsert({
      where: { code: dict.code },
      update: { name: dict.name, status: 1 },
      create: { name: dict.name, code: dict.code, status: 1 },
    });
    for (let index = 0; index < dict.items.length; index += 1) {
      const [label, value, listClass] = dict.items[index];
      await prisma.sysDictData.upsert({
        where: { dictTypeId_value: { dictTypeId: type.id, value } },
        update: { label, listClass, sort: index + 1, status: 1 },
        create: { dictTypeId: type.id, label, value, listClass, sort: index + 1, status: 1 },
      });
    }
  }
}

async function seedConfigs() {
  for (const [configKey, configValue, valueType, isBuiltin, remark] of configs) {
    await prisma.sysConfig.upsert({
      where: { configKey },
      update: { configValue, valueType, isBuiltin: Number(isBuiltin), remark, status: 1 },
      create: { name: String(remark), configKey, configValue, valueType, isBuiltin: Number(isBuiltin), remark, status: 1 },
    });
  }
}

async function seedRolesAndUsers() {
  const platformRole = await prisma.sysRole.upsert({
    where: { id: 1n },
    update: { tenantId: null, name: '超级管理员', code: 'platform_admin', dataScope: 1, status: 1 },
    create: { id: 1n, tenantId: null, name: '超级管理员', code: 'platform_admin', dataScope: 1, status: 1 },
  });
  const tenantRole = await prisma.sysRole.upsert({
    where: { id: 2n },
    update: { tenantId: 2n, name: '租户管理员', code: 'tenant_admin', dataScope: 1, status: 1 },
    create: { id: 2n, tenantId: 2n, name: '租户管理员', code: 'tenant_admin', dataScope: 1, status: 1 },
  });
  const commonRole = await prisma.sysRole.upsert({
    where: { id: 3n },
    update: { tenantId: 2n, name: '普通用户', code: 'common', dataScope: 5, status: 1 },
    create: { id: 3n, tenantId: 2n, name: '普通用户', code: 'common', dataScope: 5, status: 1 },
  });

  const allMenus = await prisma.sysMenu.findMany({ select: { id: true, perms: true } });
  const tenantMenus = allMenus.filter((menu) => !menu.perms?.startsWith('system:tenant') && !menu.perms?.startsWith('tool:gen'));
  const commonMenus = allMenus.filter((menu) => [1n, 6n, 28n].includes(menu.id) || menu.perms?.startsWith('system:notice'));

  await replaceRoleMenus(platformRole.id, allMenus.map((menu) => menu.id));
  await replaceRoleMenus(tenantRole.id, tenantMenus.map((menu) => menu.id));
  await replaceRoleMenus(commonRole.id, commonMenus.map((menu) => menu.id));

  const users = [
    { id: 1n, username: 'admin', nickname: '超级管理员', tenantId: 1n, deptId: 1n, isPlatformAdmin: 1, roleId: platformRole.id },
    { id: 2n, username: 'tenantadmin', nickname: '租户管理员', tenantId: 2n, deptId: 2n, isPlatformAdmin: 0, roleId: tenantRole.id },
    { id: 3n, username: 'user', nickname: '普通用户', tenantId: 2n, deptId: 21n, isPlatformAdmin: 0, roleId: commonRole.id },
  ];
  for (const user of users) {
    const { roleId, ...userData } = user;
    await prisma.sysUser.upsert({
      where: { id: user.id },
      update: { ...userData, password, status: 1 },
      create: { ...userData, password, status: 1 },
    });
    await prisma.sysUserRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    });
  }
}

async function replaceRoleMenus(roleId: bigint, menuIds: bigint[]) {
  await prisma.sysRoleMenu.deleteMany({ where: { roleId } });
  if (menuIds.length) {
    await prisma.sysRoleMenu.createMany({
      data: menuIds.map((menuId) => ({ roleId, menuId })),
      skipDuplicates: true,
    });
  }
}

async function seedNotices() {
  await prisma.sysNotice.upsert({
    where: { id: 1n },
    update: { tenantId: 2n, title: '欢迎使用 Nest-Admin-Pro', content: '默认数据已初始化完成。', type: 2, status: 1, publishAt: new Date('2026-06-03T00:00:00.000Z') },
    create: { id: 1n, tenantId: 2n, title: '欢迎使用 Nest-Admin-Pro', content: '默认数据已初始化完成。', type: 2, status: 1, publishAt: new Date('2026-06-03T00:00:00.000Z') },
  });
}

async function main() {
  await seedTenants();
  await seedDepartments();
  await seedPosts();
  await seedMenus();
  await seedDicts();
  await seedConfigs();
  await seedRolesAndUsers();
  await seedNotices();

  const [userCount, menuCount] = await Promise.all([
    prisma.sysUser.count(),
    prisma.sysMenu.count(),
  ]);
  console.log('Seed completed:', { userCount, menuCount });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
