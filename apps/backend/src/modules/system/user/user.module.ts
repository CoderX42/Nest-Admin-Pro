import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { SysUserRoleEntity } from './user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SysUserRoleEntity])],
})
export class UserModule {}
