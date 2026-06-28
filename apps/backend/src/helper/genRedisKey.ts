import { REDIS_KEY_PREFIX } from '@/constants/redis.constant';

/**
 * Redis Key 生成器（统一前缀、便于跨节点迁移/清理）
 * 命名约定：nap:{module}:{sub}:{id}
 */
export const genCaptchaImgKey = (id: string) =>
  `${REDIS_KEY_PREFIX.CAPTCHA_IMG}:${id}`;

export const genCaptchaEmailKey = (email: string) =>
  `${REDIS_KEY_PREFIX.CAPTCHA_EMAIL}:${email}`;

export const genTokenKey = (uid: number, jti: string) =>
  `${REDIS_KEY_PREFIX.ACCESS_TOKEN}:${uid}:${jti}`;

export const genRefreshTokenKey = (uid: number, jti: string) =>
  `${REDIS_KEY_PREFIX.REFRESH_TOKEN}:${uid}:${jti}`;

export const genTokenBlacklistKey = (jti: string) =>
  `${REDIS_KEY_PREFIX.TOKEN_BLACKLIST}:${jti}`;

export const genPermKey = (uid: number) =>
  `${REDIS_KEY_PREFIX.USER_PERMS}:${uid}`;

export const genPasswordVersionKey = (uid: number) =>
  `${REDIS_KEY_PREFIX.USER_PASSWORD_VERSION}:${uid}`;

export const genOnlineUserKey = (uid: number) =>
  `${REDIS_KEY_PREFIX.ONLINE_USER}:${uid}`;

export const genOnlineUserSetKey = () =>
  `${REDIS_KEY_PREFIX.ONLINE_USER}:set`;

export const genServerStatKey = () =>
  `${REDIS_KEY_PREFIX.SERVER_STAT}`;

export const genIdempotenceKey = (id: string) =>
  `${REDIS_KEY_PREFIX.IDEMPOTENCE}:${id}`;
