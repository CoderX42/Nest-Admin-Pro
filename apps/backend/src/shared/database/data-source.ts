import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import * as path from 'path';

loadEnv({ path: path.resolve(process.cwd(), '.env') });

export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) ?? 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'nest_admin',
  charset: 'utf8mb4',
  timezone: '+08:00',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true' ? 'all' : (['error', 'warn'] as any),
  entities: [path.join(__dirname, '../../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../../migrations/*{.ts,.js}')],
});

export default AppDataSource;
