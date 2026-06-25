import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenEntity, RefreshTokenEntity } from './token.entity';
import { UserEntity } from '@/modules/system/user/user.entity';
import { SysUserRoleEntity } from '@/modules/system/user/user-role.entity';
import { RoleEntity } from '@/modules/system/role/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessTokenEntity, RefreshTokenEntity, UserEntity, SysUserRoleEntity, RoleEntity])],
})
export class AuthModule {}
