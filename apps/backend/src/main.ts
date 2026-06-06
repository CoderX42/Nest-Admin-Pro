import { NestFactory } from '@nestjs/core';
import { Logger as NestLogger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger as PinoLogger } from 'nestjs-pino';
import compression = require('compression');
import helmet from 'helmet';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));
  const logger = new NestLogger('Bootstrap');
  const configService = app.get(ConfigService);
  const appName = configService.get<string>('app.name', 'Nest-Admin-Pro');
  const appEnv = configService.get<string>('app.env', 'development');
  const port = configService.get<number>('app.port', 3000);
  const uploadDir = configService.get<string>('app.uploadDir', './uploads');
  const corsOrigin = configService.get<string>(
    'app.corsOrigin',
    'http://localhost:5173,http://localhost:5174',
  );

  app.use(helmet());
  app.use(compression());
  app.enableCors({ origin: corsOrigin.split(','), credentials: true });

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'health', method: RequestMethod.ALL },
      { path: 'file/(.*)', method: RequestMethod.ALL },
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Nest-Admin-Pro API')
    .setDescription('全栈快速开发框架接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc.html', app, document);
  SwaggerModule.setup('api-docs', app, document);

  // Static file serving for uploads
  app.useStaticAssets(path.resolve(process.cwd(), uploadDir), {
    prefix: '/file/',
  });
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`${appName} (${appEnv}) running on http://localhost:${port}`);
  logger.log(`API Docs: http://localhost:${port}/api-docs`);
}

bootstrap();
