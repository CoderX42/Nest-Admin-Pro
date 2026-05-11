import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../cache/redis.service';

@Injectable()
export class CacheService {
  constructor(private redis: RedisService) {}

  async info() {
    return this.redis.info();
  }

  async keys(pattern: string) {
    return this.redis.keys(pattern);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async clear() {
    await this.redis.flushdb();
    return { success: true };
  }

  async delete(key: string) {
    await this.redis.del(key);
    return { success: true };
  }
}