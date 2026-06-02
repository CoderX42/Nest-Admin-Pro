import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../cache/redis.service';

export interface DependencyStatus {
  status: 'ok' | 'unavailable';
  latencyMs?: number;
  error?: string;
}

export interface HealthCheckResult {
  status: 'ok';
  uptime: number;
  timestamp: number;
  db: DependencyStatus;
  redis: DependencyStatus;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const [db, redis] = await Promise.all([this.checkDb(), this.checkRedis()]);

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      db,
      redis,
    };
  }

  private async checkDb(): Promise<DependencyStatus> {
    const startedAt = Date.now();
    try {
      await this.withTimeout(this.prisma.$queryRaw`SELECT 1`, 500);
      return { status: 'ok', latencyMs: Date.now() - startedAt };
    } catch (error) {
      return {
        status: 'unavailable',
        latencyMs: Date.now() - startedAt,
        error: this.toErrorMessage(error),
      };
    }
  }

  private async checkRedis(): Promise<DependencyStatus> {
    const startedAt = Date.now();
    try {
      await this.withTimeout(this.redis.ping(), 500);
      return { status: 'ok', latencyMs: Date.now() - startedAt };
    } catch (error) {
      return {
        status: 'unavailable',
        latencyMs: Date.now() - startedAt,
        error: this.toErrorMessage(error),
      };
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Health check timeout')), timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private toErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
