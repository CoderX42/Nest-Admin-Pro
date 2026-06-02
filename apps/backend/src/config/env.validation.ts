import { z } from 'zod';

const envSchema = z.object({
  APP_NAME: z.string().default('Nest-Admin-Pro'),
  APP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().url().startsWith('mysql://'),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
  REDIS_KEY_PREFIX: z.string().default('nap:'),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(16).optional().default('change-me-too-please'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  THROTTLE_TTL: z.coerce.number().int().positive().default(60000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(60),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:5174'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_IMAGE_SIZE: z.coerce.number().int().positive().default(2097152),
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(104857600),
  FILE_STORAGE: z.string().default('local'),
  FILE_PUBLIC_URL: z.string().default('http://localhost:3000/file'),
  FILE_CLOUD_REGION: z.string().optional().default(''),
  FILE_CLOUD_BUCKET: z.string().optional().default(''),
  FILE_CLOUD_ACCESS_KEY_ID: z.string().optional().default(''),
  FILE_CLOUD_ACCESS_KEY_SECRET: z.string().optional().default(''),
  FILE_CLOUD_ENDPOINT: z.string().optional().default(''),
  FILE_CLOUD_PREFIX: z.string().default('uploads'),
  FILE_CLOUD_PUBLIC_URL: z.string().optional().default(''),
  FILE_CLOUD_SECURE: z.coerce.boolean().default(true),
  CAPTCHA_ENABLED: z.coerce.boolean().default(true),
  CAPTCHA_TTL: z.coerce.number().int().positive().default(120),
  TENANT_DEFAULT_ID: z.coerce.number().int().positive().default(1),
  TENANT_PLATFORM_ADMIN_ROLE_CODE: z.string().default('platform_admin'),
  SWAGGER_ENABLED: z.coerce.boolean().default(true),
});

export function envValidate(raw: Record<string, unknown>) {
  const parsed = envSchema.parse(raw);
  if (parsed.APP_ENV === 'production' && parsed.JWT_SECRET === 'change-me-please') {
    throw new Error('JWT_SECRET must be changed in production');
  }
  return parsed;
}
