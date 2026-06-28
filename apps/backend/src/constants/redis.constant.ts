/** Redis Key 命名空间前缀（与 genRedisKey 配合使用） */
export const REDIS_KEY_PREFIX = {
  CAPTCHA_IMG: 'captcha:img',
  CAPTCHA_EMAIL: 'captcha:email',
  ACCESS_TOKEN: 'token:access',
  REFRESH_TOKEN: 'token:refresh',
  TOKEN_BLACKLIST: 'token:blacklist',
  USER_PERMS: 'user:perms',
  USER_PASSWORD_VERSION: 'user:pv',
  ONLINE_USER: 'user:online',
  SERVER_STAT: 'sys:serve-stat',
  THROTTLE: 'throttle',
  IDEMPOTENCE: 'idemp',
} as const;
