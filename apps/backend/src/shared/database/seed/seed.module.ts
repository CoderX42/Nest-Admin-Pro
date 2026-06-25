import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';
import { UserEntity } from '@/modules/system/user/user.entity';
import { RoleEntity } from '@/modules/system/role/role.entity';
import { MenuEntity } from '@/modules/system/menu/menu.entity';
import { DeptEntity } from '@/modules/system/dept/dept.entity';
import { SysUserRoleEntity } from '@/modules/system/user/user-role.entity';
import { SysRoleMenuEntity } from '@/modules/system/role/role-menu.entity';
import { ParamConfigEntity } from '@/modules/system/param-config/param-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity, RoleEntity, MenuEntity, DeptEntity,
      SysUserRoleEntity, SysRoleMenuEntity, ParamConfigEntity,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
