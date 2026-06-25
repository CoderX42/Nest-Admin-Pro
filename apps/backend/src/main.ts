import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const adapter = new FastifyAdapter({
    logger: false,
    trustProxy: true,
    bodyLimit: 10485760,
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });

  const reflector = app.get(Reflector);
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 3000;
  const apiPrefix = 'api';

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableCors({ origin: true, credentials: true });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix(apiPrefix);

  await app.register(fastifyCookie as any);
  await app.register(fastifyMultipart as any, {
    limits: {
      fileSize: config.get<number>('app.maxFileSize') ?? 104857600,
      files: 20,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new TransformInterceptor(reflector),
  );

  const swaggerCfg = config.get('swagger');
  const docBuilder = new DocumentBuilder()
    .setTitle(swaggerCfg.title)
    .setDescription(swaggerCfg.desc)
    .setVersion(swaggerCfg.version)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'Authorization')
    .addBasicAuth({ type: 'http', scheme: 'basic' }, 'Basic');
  const document = SwaggerModule.createDocument(app, docBuilder.build());
  SwaggerModule.setup(`${apiPrefix}/doc`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`\n[bootstrap] Nest-Admin-Pro listening on http://localhost:${port}/${apiPrefix}`);
  // eslint-disable-next-line no-console
  console.log(`[bootstrap] Swagger UI:   http://localhost:${port}/${apiPrefix}/doc`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[bootstrap] failed:', err);
  process.exit(1);
});
