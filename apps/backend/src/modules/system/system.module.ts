import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { DeptModule } from './dept/dept.module';
import { MenuModule } from './menu/menu.module';
import { PostModule } from './post/post.module';
import { DictModule } from './dict/dict.module';
import { ConfigModule } from './config/config.module';
import { NoticeModule } from './notice/notice.module';

@Module({
  imports: [
    UserModule,
    RoleModule,
    DeptModule,
    MenuModule,
    PostModule,
    DictModule,
    ConfigModule,
    NoticeModule,
  ],
})
export class SystemModule {}
