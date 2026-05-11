import { Module } from '@nestjs/common';
import { LoginLogModule } from './login-log/login-log.module';
import { OperLogModule } from './oper-log/oper-log.module';
import { OnlineModule } from './online/online.module';
import { ServerModule } from './server/server.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [LoginLogModule, OperLogModule, OnlineModule, ServerModule, CacheModule],
})
export class MonitorModule {}