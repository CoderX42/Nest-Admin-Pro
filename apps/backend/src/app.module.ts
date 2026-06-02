import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { randomUUID } from 'node:crypto';
import { LoggerModule } from 'nestjs-pino';
import appConfig from './config/env.config';
import { envValidate } from './config/env.validation';
import { CommonModule } from './common/common.module';
import { RedisModule } from './cache/redis.module';
import { AuthModule } from './auth/auth.module';
import { SystemModule } from './modules/system/system.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { FileModule } from './modules/file/file.module';
import { GenModule } from './modules/gen/gen.module';
import { HealthModule } from './health/health.module';
import { GlobalExceptionFilter } from './common/exception.filter';
import { TransformInterceptor } from './common/transform.interceptor';
import { OperLogInterceptor } from './common/oper-log.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { RedisThrottlerStorage } from './common/throttler/redis-throttler.storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: envValidate,
      load: [appConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.APP_ENV === 'development'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        genReqId: (req) => {
          const header = req.headers['x-request-id'];
          return Array.isArray(header) ? header[0] : header ?? randomUUID();
        },
        autoLogging: {
          ignore: (req) =>
            req.url?.startsWith('/health') === true ||
            req.url?.startsWith('/api-docs') === true ||
            req.url?.startsWith('/doc.html') === true,
        },
        customProps: (req) => ({ traceId: req.id }),
        redact: [
          'req.headers.authorization',
          'req.body.password',
          'req.body.oldPassword',
          'req.body.newPassword',
          'req.body.token',
          'req.body.accessKeySecret',
        ],
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: new RedisThrottlerStorage({
          host: configService.get<string>('redis.host', '127.0.0.1'),
          port: configService.get<number>('redis.port', 6379),
          password: configService.get<string>('redis.password'),
          db: configService.get<number>('redis.db', 0),
          keyPrefix: configService.get<string>('REDIS_KEY_PREFIX', 'nap:'),
        }),
        throttlers: [
          {
            name: 'default',
            ttl: configService.get<number>('THROTTLE_TTL', 60_000),
            limit: configService.get<number>('THROTTLE_LIMIT', 60),
          },
        ],
      }),
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    RedisModule,
    AuthModule,
    SystemModule,
    MonitorModule,
    FileModule,
    GenModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OperLogInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
