import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import appConfig from './config/app.config';
import dbConfig from './config/db.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import throttleConfig from './config/throttle.config';
import mailConfig from './config/mail.config';
import ossConfig from './config/oss.config';
import swaggerConfig from './config/swagger.config';
import captchaConfig from './config/captcha.config';

import { DatabaseModule } from './shared/database/database.module';
import { RedisModule } from './shared/redis/redis.module';
import { LoggerModule } from './shared/logger/logger.module';
import { MailerModule } from './shared/mailer/mailer.module';
import { AppJwtModule } from './shared/jwt/jwt.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RbacGuard } from './common/guards/rbac.guard';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';

import { AuthModule } from './modules/auth/auth.module';
import { SystemModule } from './modules/system/system.module';
import { HealthModule } from './modules/health/health.module';
import { SeedModule } from './shared/database/seed/seed.module';
import { ToolsModule } from './modules/tools/tools.module';
import { TodoModule } from './modules/todo/todo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        appConfig,
        dbConfig,
        redisConfig,
        jwtConfig,
        throttleConfig,
        mailConfig,
        ossConfig,
        swaggerConfig,
        captchaConfig,
      ],
    }),
    // 定时任务（@nestjs/schedule）
    ScheduleModule.forRoot(),
    // 限流
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => [
        { ttl: cfg.get<number>('throttle.ttl') ?? 60_000, limit: cfg.get<number>('throttle.limit') ?? 20 },
      ],
    }),
    // 数据库
    DatabaseModule,
    // 基础设施
    LoggerModule,
    RedisModule,
    MailerModule,
    AppJwtModule,
    // 业务模块
    AuthModule,
    SystemModule,
    ToolsModule,
    TodoModule,
    HealthModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
  ],
})
export class AppModule {}
