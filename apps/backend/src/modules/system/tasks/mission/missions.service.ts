import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { registerMission } from './mission.types';

/**
 * Demo / 系统内置任务集合。
 * 真实业务可在此注册自家 mission（例如清理日志、刷新权限、汇总统计等）。
 */
@Injectable()
export class MissionsService implements OnModuleInit {
  private readonly logger = new Logger(MissionsService.name);

  onModuleInit() {
    // 1) system.test.echo - 简单回显，用于冒烟测试
    registerMission(
      'system.test.echo',
      async (args) => {
        await new Promise((r) => setTimeout(r, 50));
        return { echoed: args ?? null, at: new Date().toISOString() };
      },
      '回显参数（冒烟测试）',
    );

    // 2) system.test.fail - 故意抛错，用于测试失败日志
    registerMission(
      'system.test.fail',
      async () => {
        throw new Error('intentional failure for test');
      },
      '故意失败的测试任务',
    );

    // 3) system.test.sleep - 模拟耗时任务
    registerMission(
      'system.test.sleep',
      async (args) => {
        const ms = Math.max(0, Math.min(5000, Number(args?.ms ?? 500)));
        await new Promise((r) => setTimeout(r, ms));
        return { sleptMs: ms };
      },
      '模拟耗时任务（args.ms 默认 500，最大 5000）',
    );

    // 4) system.cache.warmup - 示例任务：唤醒应用缓存
    registerMission(
      'system.cache.warmup',
      async () => {
        // 这里只是占位：真实场景可 warm-up Redis 缓存、字典表、菜单等
        await new Promise((r) => setTimeout(r, 80));
        return { warmedAt: new Date().toISOString() };
      },
      '唤醒关键缓存（字典/菜单/参数）',
    );

    this.logger.log(`registered 4 demo missions`);
  }
}
