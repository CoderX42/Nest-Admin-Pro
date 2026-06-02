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
import { GlobalExceptionFilter } from './common/exception.filter';
import { TransformInterceptor } from './common/transform.interceptor';
import { OperLogInterceptor } from './common/oper-log.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';

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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    ScheduleModule.forRoot(),
    CommonModule,
    RedisModule,
    AuthModule,
    SystemModule,
    MonitorModule,
    FileModule,
    GenModule,
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
