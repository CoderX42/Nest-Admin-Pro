import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { CACHE_TTL } from '@/constants/cache.constant';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async onModuleDestroy() {
    try { await this.client.quit(); } catch {}
  }

  raw(): Redis { return this.client; }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: any, ttlMs?: number): Promise<'OK'> {
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlMs) return (await this.client.set(key, v, 'PX', ttlMs)) as any;
    return (await this.client.set(key, v)) as any;
  }

  async setNx(key: string, value: any, ttlMs?: number): Promise<boolean> {
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    const ok = ttlMs
      ? await this.client.set(key, v, 'PX', ttlMs, 'NX')
      : await this.client.set(key, v, 'NX');
    return ok === 'OK';
  }

  async del(key: string | string[]): Promise<number> {
    return Array.isArray(key) ? this.client.del(...key) : this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) > 0;
  }

  async expire(key: string, ttlSec: number): Promise<number> {
    return this.client.expire(key, ttlSec);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async hset(key: string, field: string, value: any): Promise<number> {
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    return this.client.hset(key, field, v);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, ...members);
  }

  /** 通用 JSON 缓存 helper */
  async getJson<T = any>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    if (!v) return null;
    try { return JSON.parse(v) as T; } catch { return v as any; }
  }

  async setJson(key: string, value: any, ttlSec: number = CACHE_TTL.FIVE_MINUTES): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSec);
  }
}
