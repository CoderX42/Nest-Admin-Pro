import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('db', () => ({
  type: (process.env.DB_TYPE ?? 'mysql') as TypeOrmModuleOptions['type'],
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'nest_admin',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true' ? 'all' : ['error', 'warn'] as any,
  charset: 'utf8mb4',
  timezone: '+08:00',
  autoLoadEntities: true,
  // entities / migrations 由 DatabaseModule 注入
}));
