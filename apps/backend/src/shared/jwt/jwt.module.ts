import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from './jwt.service';

/**
 * 全局 JWT 模块：注入 JwtService（用于 verify）+ JwtTokenService（用于签发双令牌）
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('jwt.secret'),
        signOptions: { expiresIn: Number(cfg.get<number>('jwt.expire') ?? 7200) },
      }),
    }),
  ],
  providers: [JwtTokenService],
  exports: [JwtModule, JwtTokenService],
})
export class AppJwtModule {}
