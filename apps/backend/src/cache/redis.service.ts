import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    });

    this.client.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    this.client.on('error', (err) => {
      console.error('[Redis] Connection error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as any;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async flushdb(): Promise<void> {
    await this.client.flushdb();
  }

  async info(section?: string): Promise<Record<string, string>> {
    const info = await this.client.info(section || 'all');
    const result: Record<string, string> = {};
    for (const line of info.split('\r\n')) {
      if (line.includes(':') && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    return result;
  }

  // Online user management
  async setOnlineUser(token: string, userId: string, ttlSeconds = 3600 * 24): Promise<void> {
    await this.client.setex(`online:user:${token}`, ttlSeconds, userId);
    await this.client.sadd(`online:users`, token);
  }

  async removeOnlineUser(token: string): Promise<void> {
    await this.client.del(`online:user:${token}`);
    await this.client.srem(`online:users`, token);
  }

  async getOnlineUser(token: string): Promise<string | null> {
    return await this.client.get(`online:user:${token}`);
  }

  async getOnlineUsers(): Promise<string[]> {
    return await this.client.smembers(`online:users`);
  }

  // Cache helpers
  async hset(key: string, field: string, value: any): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as any;
    }
  }

  async hgetall<T = any>(key: string): Promise<Record<string, T>> {
    const data = await this.client.hgetall(key);
    const result: Record<string, T> = {};
    for (const [k, v] of Object.entries(data)) {
      try {
        result[k] = JSON.parse(v) as T;
      } catch {
        result[k] = v as any;
      }
    }
    return result;
  }
}
