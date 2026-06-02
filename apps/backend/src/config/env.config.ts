import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'Nest-Admin-Pro',
  port: parseInt(process.env.APP_PORT || '3000', 10),
  env: process.env.APP_ENV || 'dev',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE || '2097152', 10),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10),
  fileStorage: process.env.FILE_STORAGE || 'local',
  fileCloudRegion: process.env.FILE_CLOUD_REGION || process.env.OSS_REGION || '',
  fileCloudBucket: process.env.FILE_CLOUD_BUCKET || process.env.OSS_BUCKET || '',
  fileCloudEndpoint: process.env.FILE_CLOUD_ENDPOINT || process.env.OSS_ENDPOINT || '',
  fileCloudPrefix: process.env.FILE_CLOUD_PREFIX || process.env.OSS_PREFIX || 'uploads',
  fileCloudPublicUrl: process.env.FILE_CLOUD_PUBLIC_URL || process.env.OSS_PUBLIC_URL || process.env.OSS_CDN_URL || '',
  ossRegion: process.env.OSS_REGION || '',
  ossBucket: process.env.OSS_BUCKET || '',
  ossEndpoint: process.env.OSS_ENDPOINT || '',
  ossPrefix: process.env.OSS_PREFIX || 'uploads',
  ossPublicUrl: process.env.OSS_PUBLIC_URL || process.env.OSS_CDN_URL || '',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL || '',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
}));

export const mailConfig = registerAs('mail', () => ({
  host: process.env.MAIL_HOST || '',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  user: process.env.MAIL_USER || '',
  pass: process.env.MAIL_PASS || '',
  from: process.env.MAIL_FROM || '',
}));

export const wechatConfig = registerAs('wechat', () => ({
  appid: process.env.WECHAT_APPID || '',
  secret: process.env.WECHAT_SECRET || '',
}));
