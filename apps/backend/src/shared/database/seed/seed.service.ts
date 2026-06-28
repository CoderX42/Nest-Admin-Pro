import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { UserEntity } from '@/modules/system/user/user.entity';
import { RoleEntity } from '@/modules/system/role/role.entity';
import { MenuEntity } from '@/modules/system/menu/menu.entity';
import { DeptEntity } from '@/modules/system/dept/dept.entity';
import { SysUserRoleEntity } from '@/modules/system/user/user-role.entity';
import { SysRoleMenuEntity } from '@/modules/system/role/role-menu.entity';
import { ParamConfigEntity } from '@/modules/system/param-config/param-config.entity';
import { encryptPassword, makeSalt } from '@/helper/md5';

/**
 * 首次启动种子：root 部门 / super_admin 角色 / admin 用户 / 完整菜单树 / 默认参数
 * - 仅当 sys_user 表为空时执行
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(MenuEntity) private readonly menuRepo: Repository<MenuEntity>,
    @InjectRepository(DeptEntity) private readonly deptRepo: Repository<DeptEntity>,
    @InjectRepository(SysUserRoleEntity) private readonly userRoleRepo: Repository<SysUserRoleEntity>,
    @InjectRepository(SysRoleMenuEntity) private readonly roleMenuRepo: Repository<SysRoleMenuEntity>,
    @InjectRepository(ParamConfigEntity) private readonly paramRepo: Repository<ParamConfigEntity>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.userRepo.count();
    if (count > 0) {
      this.logger.log(`[seed] skip — ${count} users already exist`);
      return;
    }
    this.logger.log('[seed] empty database, seeding initial data...');

    await this.dataSource.transaction(async (em) => {
      // 1) 根部门
      const rootDept = await em.save(DeptEntity, em.create(DeptEntity, {
        name: '总集团', parentId: 0, path: ',', sort: 1,
        leader: 'admin', phone: '', email: '',
        status: 1, remark: '系统根部门',
      }));
      const childDept = await em.save(DeptEntity, em.create(DeptEntity, {
        name: '研发部', parentId: rootDept.id, path: `,${rootDept.id},`, sort: 1,
        leader: 'admin', status: 1, remark: '默认部门',
      }));

      // 2) super_admin 角色
      const rootRole = await em.save(RoleEntity, em.create(RoleEntity, {
        name: '超级管理员', code: 'super_admin', builtin: 1,
        sort: 1, dataScope: 1, status: 1, remark: '系统内置最高权限',
      }));
      const commonRole = await em.save(RoleEntity, em.create(RoleEntity, {
        name: '普通用户', code: 'user', builtin: 1, sort: 9, dataScope: 5, status: 1,
      }));

      // 3) 完整菜单树（系统管理 + 工具 + 监控）
      const menus: Array<Partial<MenuEntity>> = [
        // 系统管理（目录）
        { name: '系统管理', type: 1, parentId: 0, path: '/system', component: 'LAYOUT', icon: 'ion:settings-outline', sort: 1, perms: 'system', hide: 0, keepAlive: 0, external: 0, status: 1 },
        { name: '用户管理', type: 2, parentId: 0, path: 'user', component: '/system/user/index', icon: 'mdi:account', sort: 1, perms: 'system:user:list', status: 1 },
        { name: '角色管理', type: 2, parentId: 0, path: 'role', component: '/system/role/index', icon: 'mdi:account-cog', sort: 2, perms: 'system:role:list', status: 1 },
        { name: '菜单管理', type: 2, parentId: 0, path: 'menu', component: '/system/menu/index', icon: 'mdi:menu', sort: 3, perms: 'system:menu:list', status: 1 },
        { name: '部门管理', type: 2, parentId: 0, path: 'dept', component: '/system/dept/index', icon: 'mdi:office-building', sort: 4, perms: 'system:dept:list', status: 1 },
        { name: '字典管理', type: 2, parentId: 0, path: 'dict', component: '/system/dict/index', icon: 'mdi:book-open-variant', sort: 5, perms: 'system:dict:list', status: 1 },
        { name: '参数配置', type: 2, parentId: 0, path: 'config', component: '/system/param-config/index', icon: 'mdi:cog', sort: 6, perms: 'system:param-config:list', status: 1 },
        { name: '通知公告', type: 2, parentId: 0, path: 'notice', component: '/system/notice/index', icon: 'mdi:bell-outline', sort: 7, perms: 'system:notice:list', status: 1 },
        // 系统监控（目录）
        { name: '系统监控', type: 1, parentId: 0, path: '/monitor', component: 'LAYOUT', icon: 'mdi:monitor-eye', sort: 2, perms: 'monitor', status: 1 },
        { name: '在线用户', type: 2, parentId: 0, path: 'online', component: '/monitor/online/index', icon: 'mdi:account-group', sort: 1, perms: 'monitor:online:list', status: 1 },
        { name: '操作日志', type: 2, parentId: 0, path: 'oper-log', component: '/monitor/oper-log/index', icon: 'mdi:text-box-search-outline', sort: 2, perms: 'monitor:oper-log:list', status: 1 },
        { name: '登录日志', type: 2, parentId: 0, path: 'login-log', component: '/monitor/login-log/index', icon: 'mdi:login', sort: 3, perms: 'monitor:login-log:list', status: 1 },
        { name: '服务监控', type: 2, parentId: 0, path: 'serve', component: '/monitor/serve/index', icon: 'mdi:server', sort: 4, perms: 'monitor:serve:list', status: 1 },
        { name: '定时任务', type: 2, parentId: 0, path: 'task', component: '/monitor/task/index', icon: 'mdi:calendar-clock', sort: 5, perms: 'monitor:task:list', status: 1 },
        // 工具模块（目录）
        { name: '工具模块', type: 1, parentId: 0, path: '/tools', component: 'LAYOUT', icon: 'mdi:toolbox-outline', sort: 3, perms: 'tools', status: 1 },
        { name: '文件存储', type: 2, parentId: 0, path: 'storage', component: '/tools/storage/index', icon: 'mdi:folder-multiple-image', sort: 1, perms: 'tools:storage:list', status: 1 },
        { name: '邮件发送', type: 2, parentId: 0, path: 'email', component: '/tools/email/index', icon: 'mdi:email-outline', sort: 2, perms: 'tools:email:list', status: 1 },
      ];

      // 我们需要把菜单按"目录→菜单"层次排好，并维护 parentId 关联到目录
      // 步骤：先插入目录（type=1），拿到 id，再插入其下子菜单
      const dirSystem = menus.filter(m => m.type === 1 && m.path === '/system');
      const dirMonitor = menus.filter(m => m.type === 1 && m.path === '/monitor');
      const dirTools = menus.filter(m => m.type === 1 && m.path === '/tools');

      const sysDir = await em.save(MenuEntity, em.create(MenuEntity, dirSystem[0]));
      const monDir = await em.save(MenuEntity, em.create(MenuEntity, dirMonitor[0]));
      const toolsDir = await em.save(MenuEntity, em.create(MenuEntity, dirTools[0]));

      const childMenus = menus
        .filter(m => m.type === 2)
        .map(m => ({ ...m, parentId:
          m.path && ['user','role','menu','dept','dict','config','notice'].includes(m.path) ? sysDir.id :
          m.path && ['online','oper-log','login-log','serve','task'].includes(m.path) ? monDir.id :
          m.path && ['storage','email'].includes(m.path) ? toolsDir.id : 0 }));

      const savedChildren = await em.save(MenuEntity, childMenus.map(m => em.create(MenuEntity, m)));

      // 4) super_admin 拥有全部菜单
      const roleMenus = savedChildren.concat([sysDir, monDir, toolsDir]).map(m => ({
        roleId: rootRole.id, menuId: m.id,
      }));
      await em.save(SysRoleMenuEntity, roleMenus.map(rm => em.create(SysRoleMenuEntity, rm)));

      // 5) admin 用户
      const adminUser = em.create(UserEntity, {
        username: this.config.get<string>('app.adminUser') ?? 'admin',
        nickname: '超级管理员',
        password: encryptPassword('admin123', makeSalt(0)),
        salt: makeSalt(0),
        pv: 1,
        email: 'admin@example.com',
        phone: '',
        avatar: '',
        deptId: childDept.id,
        status: 1,
        remark: '系统内置超级管理员',
      });
      const savedUser = await em.save(UserEntity, adminUser);

      // 6) 绑定角色
      await em.save(SysUserRoleEntity, em.create(SysUserRoleEntity, {
        userId: savedUser.id, roleId: rootRole.id,
      }));
      await em.save(SysUserRoleEntity, em.create(SysUserRoleEntity, {
        userId: savedUser.id, roleId: commonRole.id,
      }));

      // 7) 默认参数
      const params: Array<Partial<ParamConfigEntity>> = [
        { key: 'SYS_USER_INITPASSWORD', name: '用户初始密码', value: '123456', valueType: 'string', builtin: 1, remark: '注册时默认密码' },
        { key: 'SYS_CAPTCHA_ENABLED', name: '启用图形验证码', value: 'true', valueType: 'boolean', builtin: 1, remark: '登录/注册是否需要图形验证码' },
        { key: 'SYS_REGISTER_ENABLED', name: '开放注册', value: 'true', valueType: 'boolean', builtin: 1, remark: '是否允许游客注册账号' },
        { key: 'SYS_LOGIN_RETRIES', name: '最大登录失败次数', value: '5', valueType: 'number', builtin: 1 },
      ];
      await em.save(ParamConfigEntity, params.map(p => em.create(ParamConfigEntity, p)));

      this.logger.log(`[seed] done — admin/admin123 (uid=${savedUser.id}) + 1 super_admin + 16 menus + 1 dept + 4 params`);
    });
  }
}
