import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { MenuModule } from './menu/menu.module';
import { DeptModule } from './dept/dept.module';
import { DictModule } from './dict/dict.module';
import { ParamConfigModule } from './param-config/param-config.module';
import { LogModule } from './log/log.module';
import { OnlineModule } from './online/online.module';
import { ServeModule } from './serve/serve.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    UserModule,
    RoleModule,
    MenuModule,
    DeptModule,
    DictModule,
    ParamConfigModule,
    LogModule,
    OnlineModule,
    ServeModule,
    TasksModule,
  ],
  exports: [
    UserModule,
    RoleModule,
    MenuModule,
    DeptModule,
    DictModule,
    ParamConfigModule,
    LogModule,
    OnlineModule,
    ServeModule,
    TasksModule,
  ],
})
export class SystemModule {}
