import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './role.entity';
import { SysRoleMenuEntity } from './role-menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, SysRoleMenuEntity])],
})
export class RoleModule {}
