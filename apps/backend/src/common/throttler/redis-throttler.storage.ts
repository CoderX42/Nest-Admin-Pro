import Redis from 'ioredis';
import { ThrottlerStorage } from '@nestjs/throttler/dist/throttler-storage.interface';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';

export interface RedisThrottlerStorageOptions {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix?: string;
}

export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly redis: Redis;

  constructor(options: RedisThrottlerStorageOptions) {
    this.redis = new Redis({
      host: options.host,
      port: options.port,
      password: options.password,
      db: options.db,
      keyPrefix: options.keyPrefix,
      lazyConnect: true,
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const counterKey = `throttle:${throttlerName}:${key}`;
    const blockKey = `throttle:${throttlerName}:${key}:blocked`;
    const result = (await this.redis.eval(
      `
      local block_ttl = redis.call('PTTL', KEYS[2])
      if block_ttl > 0 then
        local current = redis.call('GET', KEYS[1]) or ARGV[2]
        local counter_ttl = redis.call('PTTL', KEYS[1])
        return { tonumber(current), counter_ttl, 1, block_ttl }
      end

      local total = redis.call('INCR', KEYS[1])
      if total == 1 then
        redis.call('PEXPIRE', KEYS[1], ARGV[1])
      end

      local counter_ttl = redis.call('PTTL', KEYS[1])
      if total > tonumber(ARGV[2]) then
        redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])
        return { total, counter_ttl, 1, tonumber(ARGV[3]) }
      end

      return { total, counter_ttl, 0, 0 }
      `,
      2,
      counterKey,
      blockKey,
      ttl,
      limit,
      blockDuration,
    )) as [number, number, number, number];

    return {
      totalHits: Number(result[0] ?? 0),
      timeToExpire: Math.max(0, Math.ceil(Number(result[1] ?? 0) / 1000)),
      isBlocked: Number(result[2] ?? 0) === 1,
      timeToBlockExpire: Math.max(0, Math.ceil(Number(result[3] ?? 0) / 1000)),
    };
  }
}
