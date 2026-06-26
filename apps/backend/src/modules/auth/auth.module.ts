import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenEntity, RefreshTokenEntity } from './token.entity';
import { UserEntity } from '@/modules/system/user/user.entity';
import { SysUserRoleEntity } from '@/modules/system/user/user-role.entity';
import { RoleEntity } from '@/modules/system/role/role.entity';
import { MenuEntity } from '@/modules/system/menu/menu.entity';
import { LogModule } from '@/modules/system/log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccessTokenEntity,
      RefreshTokenEntity,
      UserEntity,
      SysUserRoleEntity,
      RoleEntity,
      MenuEntity,
    ]),
    LogModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
