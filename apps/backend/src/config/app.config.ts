import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'nest-admin-pro',
  env: process.env.APP_ENV ?? 'development',
  port: Number(process.env.APP_PORT ?? 3000),
  baseUrl: process.env.APP_BASE_URL ?? 'http://localhost:3000',
  apiPrefix: 'api',
  multiDeviceLogin: process.env.MULTI_DEVICE_LOGIN === 'true',
  tz: process.env.TZ ?? 'Asia/Shanghai',
  isDemo: process.env.IS_DEMO === 'true',
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  maxImageSize: Number(process.env.MAX_IMAGE_SIZE ?? 10485760),
  maxFileSize: Number(process.env.MAX_FILE_SIZE ?? 104857600),
  adminRole: process.env.ADMIN_ROLE ?? 'super_admin',
  adminUser: process.env.ADMIN_USER ?? 'admin',
  initPassword: process.env.INIT_PASSWORD ?? '123456',
}));
