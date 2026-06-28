import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'nest-admin-pro-secret',
  expire: Number(process.env.JWT_EXPIRE ?? 7200),
  refreshSecret: process.env.REFRESH_TOKEN_SECRET ?? 'nest-admin-pro-refresh',
  refreshExpire: Number(process.env.REFRESH_TOKEN_EXPIRE ?? 2592000),
}));
