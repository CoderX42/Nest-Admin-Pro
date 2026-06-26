import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { UserEntity } from '@/modules/system/user/user.entity';
import { RedisService } from '@/shared/redis/redis.service';
import {
  genOnlineUserKey,
  genOnlineUserSetKey,
  genPasswordVersionKey,
  genPermKey,
  genTokenBlacklistKey,
} from '@/helper/genRedisKey';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';
import { CACHE_TTL } from '@/constants/cache.constant';
import { parseUA } from '@/helper/ua-parser';

import { ListOnlineQueryDto } from './dto/online.dto';
import { KickBatchDto } from './dto/kick-batch.dto';

export interface OnlineUserItem {
  uid: number;
  username: string;
  nickname: string;
  ip: string;
  ua: string;
  browser: string;
  os: string;
  loginAt: number;
  jti: string;
  status: number;
  deptId?: number;
}

export interface OnlineListResult {
  items: OnlineUserItem[];
  total: number;
}

/** 在线记录在 Redis 中保存的 JSON 载荷 */
interface OnlinePayload {
  jti: string;
  ip: string;
  ua: string;
  loginAt: number;
}

@Injectable()
export class OnlineService {
  private readonly logger = new Logger(OnlineService.name);
  private readonly adminUserId: number;

  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    // 超级管理员默认 id=1，可被 .env 覆盖
    this.adminUserId = Number(this.config.get<number>('app.adminUserId') ?? 1);
  }

  /**
   * 当前在线用户列表（基于 Redis 集合 + 用户表关联）。
   * 注意：登录态的真实来源是 Redis 中的 token 记录；这里只读取 markOnline 写入的元数据。
   */
  async list(query: ListOnlineQueryDto): Promise<OnlineListResult> {
    const setKey = genOnlineUserSetKey();
    const uids = await this.redis.smembers(setKey);
    if (!uids.length) {
      return { items: [], total: 0 };
    }

    // 1) 拉取每个 uid 的在线元数据
    const payloads: Array<{ uid: number; payload: OnlinePayload }> = [];
    const stale: string[] = [];
    for (const uidStr of uids) {
      const raw = await this.redis.get(genOnlineUserKey(Number(uidStr)));
      if (!raw) {
        // 记录已过期（TTL 1h），从集合中清理
        stale.push(uidStr);
        continue;
      }
      try {
        const payload = JSON.parse(raw) as OnlinePayload;
        payloads.push({ uid: Number(uidStr), payload });
      } catch {
        stale.push(uidStr);
      }
    }
    if (stale.length) {
      await this.redis.srem(setKey, ...stale);
      for (const uidStr of stale) {
        await this.redis.del(genOnlineUserKey(Number(uidStr)));
      }
    }

    if (!payloads.length) {
      return { items: [], total: 0 };
    }

    // 2) 关联用户基础信息（一次查询批量拉取）
    const validUids = payloads.map((p) => p.uid);
    const users = await this.userRepo.find({
      where: { id: In(validUids) },
      select: ['id', 'username', 'nickname', 'status', 'deptId'],
    });
    // MySQL bigint 字段在 mysql2 中默认返回为 string，统一以 Number 作 key 便于与 uid 匹配
    const userMap = new Map(users.map((u) => [Number(u.id), u]));

    // 3) 组装结果 + username 过滤
    const kw = query.username?.trim().toLowerCase();
    const items: OnlineUserItem[] = [];
    for (const { uid, payload } of payloads) {
      const u = userMap.get(uid);
      if (!u) {
        // 用户已被物理删除（极端情况），清理 Redis 痕迹
        await this.redis.srem(setKey, String(uid));
        await this.redis.del(genOnlineUserKey(uid));
        continue;
      }
      if (kw && !u.username.toLowerCase().includes(kw) && !u.nickname.toLowerCase().includes(kw)) {
        continue;
      }
      const parsed = parseUA(payload.ua);
      items.push({
        uid,
        username: u.username,
        nickname: u.nickname,
        ip: payload.ip || '',
        ua: payload.ua || '',
        browser: parsed.browser,
        os: parsed.os,
        loginAt: payload.loginAt,
        jti: payload.jti,
        status: u.status,
        deptId: u.deptId,
      });
    }

    // 4) 内存排序：最新登录在前
    items.sort((a, b) => b.loginAt - a.loginAt);

    return { items, total: items.length };
  }

  /**
   * 强制下线（踢人）。
   * 策略：
   *   1) 写入当前 jti 到黑名单（即时拒绝该 token 的后续请求）
   *   2) 删除 Redis 中的 online 元数据
   *   3) user.pv + 1（让该用户的所有现有 token 在 JwtAuthGuard 校验时被拒）
   *   4) 删除 perm 缓存（防止下次登录立刻拿到旧 perm）
   */
  async kick(uid: number, currentUid: number): Promise<{ uid: number }> {
    if (uid === this.adminUserId) {
      throw new BusinessException(ErrorEnum.FAIL, '不允许强制下线超级管理员');
    }
    if (uid === currentUid) {
      throw new BusinessException(ErrorEnum.FAIL, '不能强制下线自己');
    }

    const user = await this.userRepo.findOne({ where: { id: uid } });
    if (!user) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    const raw = await this.redis.get(genOnlineUserKey(uid));
    if (raw) {
      try {
        const payload = JSON.parse(raw) as OnlinePayload;
        if (payload.jti) {
          await this.redis.set(
            genTokenBlacklistKey(payload.jti),
            '1',
            CACHE_TTL.ONE_HOUR * 1000,
          );
        }
      } catch {
        // 忽略解析错误，继续清理
      }
    }

    await this.redis.srem(genOnlineUserSetKey(), String(uid));
    await this.redis.del(genOnlineUserKey(uid));

    // pv + 1：DB 持久化 + Redis 缓存同步（让 JwtAuthGuard 即时拒绝旧 token）
    user.pv = (user.pv ?? 1) + 1;
    await this.userRepo.save(user);
    await this.redis.set(genPasswordVersionKey(uid), String(user.pv));
    await this.redis.del(genPermKey(uid));

    this.logger.log(`kick online: uid=${uid} by operator uid=${currentUid}`);
    return { uid };
  }

  /** 批量强制下线（已对单条做保护，集合内含 admin/self 时跳过该条但继续处理其余） */
  async kickBatch(uids: number[], currentUid: number): Promise<{ kicked: number[]; skipped: number[] }> {
    const kicked: number[] = [];
    const skipped: number[] = [];
    for (const uid of Array.from(new Set(uids))) {
      try {
        await this.kick(uid, currentUid);
        kicked.push(uid);
      } catch (e) {
        this.logger.warn(`kick batch skip uid=${uid}: ${(e as Error).message}`);
        skipped.push(uid);
      }
    }
    return { kicked, skipped };
  }
}
