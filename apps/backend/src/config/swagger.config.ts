import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE ?? 'Nest-Admin-Pro API',
  desc: process.env.SWAGGER_DESC ?? 'Nest-Admin-Pro 后台管理 API',
  version: process.env.SWAGGER_VERSION ?? '1.0.0',
}));
