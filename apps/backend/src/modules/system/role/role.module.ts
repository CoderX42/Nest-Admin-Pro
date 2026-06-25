import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './role.entity';
import { SysRoleMenuEntity } from './role-menu.entity';
import { MenuEntity } from '@/modules/system/menu/menu.entity';
import { SysUserRoleEntity } from '@/modules/system/user/user-role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      SysRoleMenuEntity,
      MenuEntity,
      SysUserRoleEntity,
    ]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
