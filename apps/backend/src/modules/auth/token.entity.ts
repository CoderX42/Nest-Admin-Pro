import { Column, Entity, Index } from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { CommonEntity } from '@/common/entity/common.entity';

/**
 * Access Token 记录（用于单设备登录、踢人、强登下线）
 * - jti 全局唯一（黑名单/单设备 key 都基于它）
 */
@Entity('user_access_tokens')
export class AccessTokenEntity extends CommonEntity {
  @ApiHideProperty()
  @Index()
  @Column({ type: 'bigint', comment: '用户 ID' })
  uid: number;

  @ApiHideProperty()
  @Index({ unique: true })
  @Column({ length: 32, comment: 'JWT ID（jti）' })
  jti: string;

  @ApiHideProperty()
  @Column({ length: 1024, comment: 'access token 原文' })
  token: string;

  @ApiHideProperty()
  @Column({ type: 'datetime', comment: '过期时间' })
  expiresAt: Date;

  @ApiHideProperty()
  @Column({ length: 64, nullable: true, comment: '登录 IP' })
  ip?: string;

  @ApiHideProperty()
  @Column({ length: 512, nullable: true, comment: 'User-Agent' })
  ua?: string;
}

/** Refresh Token 记录 */
@Entity('user_refresh_tokens')
export class RefreshTokenEntity extends CommonEntity {
  @ApiHideProperty()
  @Index()
  @Column({ type: 'bigint', comment: '用户 ID' })
  uid: number;

  @ApiHideProperty()
  @Index({ unique: true })
  @Column({ length: 32, comment: 'JWT ID（jti）' })
  jti: string;

  @ApiHideProperty()
  @Column({ length: 1024, comment: 'refresh token 原文' })
  token: string;

  @ApiHideProperty()
  @Column({ type: 'datetime', comment: '过期时间' })
  expiresAt: Date;
}
