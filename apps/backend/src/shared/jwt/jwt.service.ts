import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { customAlphabet } from 'nanoid';
import { IAuthUser } from '@/common/decorators/current-user.decorator';

/** JWT 完整载荷（用于签发） */
export interface JwtPayload extends IAuthUser {
  jti: string;
  iat?: number;
  exp?: number;
}

/** 双令牌签发结果 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

const jtiGen = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  24,
);

@Injectable()
export class JwtTokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpire: number;
  private readonly refreshExpire: number;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.accessSecret = this.config.get<string>('jwt.secret')!;
    this.refreshSecret = this.config.get<string>('jwt.refreshSecret')!;
    this.accessExpire = Number(this.config.get<number>('jwt.expire') ?? 7200);
    this.refreshExpire = Number(
      this.config.get<number>('jwt.refreshExpire') ?? 2592000,
    );
  }

  /** 生成 jti（去中心化唯一标识） */
  genJti(): string {
    return jtiGen();
  }

  /** 签发 access token */
  signAccess(payload: Omit<JwtPayload, 'iat' | 'exp'>): { token: string; expiresIn: number } {
    const token = this.jwt.sign(payload as any, {
      secret: this.accessSecret,
      expiresIn: this.accessExpire,
    });
    return { token, expiresIn: this.accessExpire };
  }

  /** 签发 refresh token（payload 仅保留 uid + pv + jti） */
  signRefresh(uid: number, pv: number, jti: string): { token: string; expiresIn: number } {
    const token = this.jwt.sign(
      { uid, pv, jti, typ: 'refresh' },
      { secret: this.refreshSecret, expiresIn: this.refreshExpire },
    );
    return { token, expiresIn: this.refreshExpire };
  }

  /** 一次性签发双令牌 */
  signPair(args: { uid: number; pv: number; roles: string[] }): TokenPair {
    const jti = this.genJti();
    const { token: accessToken, expiresIn: accessExpiresIn } = this.signAccess({
      uid: args.uid,
      pv: args.pv,
      jti,
      roles: args.roles,
    });
    const { token: refreshToken, expiresIn: refreshExpiresIn } = this.signRefresh(
      args.uid,
      args.pv,
      jti,
    );
    return { accessToken, refreshToken, accessExpiresIn, refreshExpiresIn };
  }

  /** 校验 access token */
  verifyAccess(token: string): JwtPayload {
    return this.jwt.verify<JwtPayload>(token, { secret: this.accessSecret });
  }

  /** 校验 refresh token */
  verifyRefresh(token: string): JwtPayload & { typ?: string } {
    return this.jwt.verify<JwtPayload & { typ?: string }>(token, {
      secret: this.refreshSecret,
    });
  }
}
