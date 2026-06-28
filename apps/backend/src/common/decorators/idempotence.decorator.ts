import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENCE_KEY = 'nest-admin:idempotence';
export interface IdempotenceOptions {
  /** 幂等有效期（秒），默认 60s */
  ttl?: number;
  /** 自定义 key，未传则用 IP+route+body */
  key?: string;
}

export const Idempotence = (options: IdempotenceOptions = {}) =>
  SetMetadata(IDEMPOTENCE_KEY, options);
