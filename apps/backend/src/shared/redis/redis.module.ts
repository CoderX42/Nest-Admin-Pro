import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService, REDIS_CLIENT } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const c = cfg.get<any>('redis');
        return new Redis({
          host: c.host,
          port: c.port,
          password: c.password,
          db: c.db,
          keyPrefix: c.keyPrefix,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
        });
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
