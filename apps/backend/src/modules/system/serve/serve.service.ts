import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import os from 'node:os';
import si from 'systeminformation';

import { RedisService } from '@/shared/redis/redis.service';
import { genServerStatKey } from '@/helper/genRedisKey';
import { CACHE_TTL } from '@/constants/cache.constant';

export interface ServeCpuStat {
  usage: number;
  cores: number;
  model: string;
  speed: number;
}

export interface ServeMemStat {
  total: number;
  used: number;
  free: number;
  usage: number;
}

export interface ServeOsStat {
  platform: string;
  arch: string;
  hostname: string;
  release: string;
  uptime: number;
}

export interface ServeDiskStat {
  fs: string;
  size: number;
  used: number;
  available: number;
  usage: number;
  type: string;
  mount: string;
}

export interface ServeNetworkStat {
  iface: string;
  ip4: string;
  ip6: string;
  mac: string;
  speed: number | null;
  internal: boolean;
}

export interface ServeNodeStat {
  version: string;
  processUptime: number;
  env: string;
  pid: number;
}

export interface ServeStat {
  cpu: ServeCpuStat;
  mem: ServeMemStat;
  os: ServeOsStat;
  disk: ServeDiskStat[];
  network: ServeNetworkStat[];
  node: ServeNodeStat;
  ts: number;
}

@Injectable()
export class ServeService {
  private readonly logger = new Logger(ServeService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 获取服务状态监控数据（带 10s Redis 缓存）。
   * systeminformation 各函数之间相互独立，使用 Promise.all 并发触发。
   */
  async getStats(): Promise<ServeStat> {
    const cacheKey = genServerStatKey();

    const cached = await this.redis.getJson<ServeStat>(cacheKey);
    if (cached) {
      return cached;
    }

    const stat = await this.collect();

    try {
      await this.redis.setJson(cacheKey, stat, CACHE_TTL.TEN_SECONDS);
    } catch (e) {
      this.logger.warn(`cache serve stat failed: ${(e as Error).message}`);
    }

    return stat;
  }

  private async collect(): Promise<ServeStat> {
    const [cpuInfo, memInfo, osInfo, fsInfo, netInfo, loadInfo] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.fsSize(),
      si.networkInterfaces(),
      si.currentLoad(),
    ]);

    const cpu: ServeCpuStat = {
      usage: Number((loadInfo?.currentLoad ?? 0).toFixed(2)),
      cores: cpuInfo.cores ?? 0,
      model: (cpuInfo.brand || cpuInfo.manufacturer || 'unknown').trim(),
      speed: cpuInfo.speed ? Number(cpuInfo.speed) : 0,
    };

    const memTotal = memInfo.total ?? 0;
    const memUsed = memInfo.active ?? memInfo.used ?? 0;
    const mem: ServeMemStat = {
      total: memTotal,
      used: memUsed,
      free: Math.max(memTotal - memUsed, 0),
      usage: memTotal > 0 ? Number(((memUsed / memTotal) * 100).toFixed(2)) : 0,
    };

    const osStat: ServeOsStat = {
      platform: osInfo.platform || process.platform,
      arch: osInfo.arch || process.arch,
      hostname: osInfo.hostname || os.hostname(),
      release: osInfo.release || '',
      uptime: Math.floor(os.uptime()),
    };

    const disk: ServeDiskStat[] = (fsInfo || [])
      .filter((d) => d && d.size > 0 && !/^(tmpfs|devtmpfs|overlay|aufs|devfs|squashfs)$/i.test(d.type || ''))
      .map((d) => ({
        fs: d.fs || '',
        size: d.size,
        used: d.used,
        available: d.available,
        usage: d.use
          ? Number(d.use.toFixed(2))
          : d.size > 0
            ? Number(((d.used / d.size) * 100).toFixed(2))
            : 0,
        type: d.type || '',
        mount: d.mount || '',
      }));

    const network: ServeNetworkStat[] = (netInfo || [])
      .filter((n) => n && n.iface && n.iface !== 'lo0' && n.iface !== 'lo')
      .map((n) => ({
        iface: n.iface,
        ip4: n.ip4 || '',
        ip6: n.ip6 || '',
        mac: n.mac || '',
        speed: n.speed ?? null,
        internal: !!n.internal,
      }));

    const node: ServeNodeStat = {
      version: process.version,
      processUptime: Math.round(process.uptime()),
      env: this.config.get<string>('app.env') ?? process.env.NODE_ENV ?? 'development',
      pid: process.pid,
    };

    return { cpu, mem, os: osStat, disk, network, node, ts: Date.now() };
  }
}
