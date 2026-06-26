import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as svgCaptcha from 'svg-captcha';
import { customAlphabet } from 'nanoid';

import { UserEntity } from '@/modules/system/user/user.entity';
import { SysUserRoleEntity } from '@/modules/system/user/user-role.entity';
import { RoleEntity } from '@/modules/system/role/role.entity';
import { MenuEntity } from '@/modules/system/menu/menu.entity';
import {
  AccessTokenEntity,
  RefreshTokenEntity,
} from '@/modules/auth/token.entity';
import {
  encryptPassword,
  makeSalt,
  checkPassword,
} from '@/helper/md5';
import {
  genCaptchaImgKey,
  genCaptchaEmailKey,
  genOnlineUserKey,
  genOnlineUserSetKey,
  genPasswordVersionKey,
  genPermKey,
  genRefreshTokenKey,
  genTokenBlacklistKey,
  genTokenKey,
} from '@/helper/genRedisKey';
import { CACHE_TTL } from '@/constants/cache.constant';
import { ErrorEnum } from '@/constants/error.enum';
import { BusinessException } from '@/common/exceptions/business.exception';
import { JwtTokenService } from '@/shared/jwt/jwt.service';
import { RedisService } from '@/shared/redis/redis.service';
import { MailerService } from '@/shared/mailer/mailer.service';
import { LoginLogService } from '@/modules/system/log/log.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/password.dto';
import { EmailCodeDto } from './dto/email-code.dto';
import {
  IMenuItem,
  ITokenPairResponse,
  IUserInfo,
} from './types/auth.types';

const emailCodeGen = customAlphabet('0123456789', 6);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly adminRole: string;

  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SysUserRoleEntity) private readonly userRoleRepo: Repository<SysUserRoleEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(MenuEntity) private readonly menuRepo: Repository<MenuEntity>,
    @InjectRepository(AccessTokenEntity) private readonly accessRepo: Repository<AccessTokenEntity>,
    @InjectRepository(RefreshTokenEntity) private readonly refreshRepo: Repository<RefreshTokenEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly jwtToken: JwtTokenService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
    private readonly loginLog: LoginLogService,
  ) {
    this.adminRole = this.config.get<string>('app.adminRole') ?? 'super_admin';
  }

  async generateCaptcha(): Promise<{ id: string; svg: string; expiresIn: number }> {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0oO1ilI',
      noise: 2,
      color: true,
      background: '#f5f5f5',
    });
    const id = this.jwtToken.genJti();
    const ttl = 5 * 60;
    await this.redis.set(genCaptchaImgKey(id), captcha.text.toLowerCase(), ttl * 1000);
    return { id, svg: captcha.data, expiresIn: ttl };
  }

  private async verifyCaptcha(id: string, code: string): Promise<boolean> {
    if (!id || !code) return false;
    const key = genCaptchaImgKey(id);
    const saved = await this.redis.get(key);
    if (!saved) return false;
    await this.redis.del(key);
    return saved === code.toLowerCase();
  }

  private async verifyEmailCode(email: string, code: string, scene: string): Promise<boolean> {
    if (!email || !code) return false;
    const key = genCaptchaEmailKey(`${scene}:${email}`);
    const saved = await this.redis.get(key);
    if (!saved) return false;
    await this.redis.del(key);
    return saved === code;
  }

  async login(
    dto: LoginDto,
    meta: { ip?: string; ua?: string },
  ): Promise<{ token: ITokenPairResponse; user: IUserInfo }> {
    let successUid: number | undefined;
    try {
      if (dto.captchaId && dto.captchaCode) {
        const ok = await this.verifyCaptcha(dto.captchaId, dto.captchaCode);
        if (!ok) throw new BusinessException(ErrorEnum.CAPTCHA_INVALID);
      }

      const user = await this.userRepo.findOne({ where: { username: dto.username } });
      if (!user) throw new BusinessException(ErrorEnum.USER_PASSWORD_ERROR);
      if (user.status === 0) throw new BusinessException(ErrorEnum.USER_DISABLED);

      if (!checkPassword(dto.password, user.salt, user.password)) {
        throw new BusinessException(ErrorEnum.USER_PASSWORD_ERROR);
      }

      const roleLinks = await this.userRoleRepo.find({ where: { userId: user.id } });
      const roleIds = roleLinks.map((r) => r.roleId);
      const roles = roleIds.length
        ? (await this.roleRepo.find({ where: { id: In(roleIds), status: 1 } })).map((r) => r.code)
        : [];

      const pair = this.jwtToken.signPair({ uid: user.id, pv: user.pv, roles });
      const accessJti = this.extractJti(pair.accessToken);
      const refreshJti = this.extractJti(pair.refreshToken);

      await this.accessRepo.save(
        this.accessRepo.create({
          uid: user.id,
          jti: accessJti,
          token: pair.accessToken,
          expiresAt: new Date(Date.now() + pair.accessExpiresIn * 1000),
          ip: meta.ip,
          ua: meta.ua,
        }),
      );
      await this.refreshRepo.save(
        this.refreshRepo.create({
          uid: user.id,
          jti: refreshJti,
          token: pair.refreshToken,
          expiresAt: new Date(Date.now() + pair.refreshExpiresIn * 1000),
        }),
      );

      await this.redis.set(genTokenKey(user.id, accessJti), pair.accessToken, pair.accessExpiresIn * 1000);
      await this.redis.set(genRefreshTokenKey(user.id, refreshJti), pair.refreshToken, pair.refreshExpiresIn * 1000);
      await this.redis.set(genPasswordVersionKey(user.id), String(user.pv));
      await this.markOnline(user.id, accessJti, meta);

      await this.userRepo.update(user.id, {
        lastLoginAt: new Date(),
        lastLoginIp: meta.ip,
      });

      const perms = await this.loadUserPerms(user.id, roles);
      await this.redis.set(genPermKey(user.id), JSON.stringify(perms), CACHE_TTL.ONE_HOUR * 1000);

      const userInfo = await this.buildUserInfo(user, roles, perms);
      successUid = user.id;
      return { token: pair, user: userInfo };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'unknown';
      await this.loginLog.record({
        uid: successUid ?? 0,
        username: dto.username,
        ip: meta.ip,
        ua: meta.ua,
        status: 0,
        message,
      });
      throw e;
    } finally {
      if (successUid !== undefined) {
        await this.loginLog.record({
          uid: successUid,
          username: dto.username,
          ip: meta.ip,
          ua: meta.ua,
          status: 1,
        });
      }
    }
  }

  async register(dto: RegisterDto): Promise<IUserInfo> {
    if (dto.email && dto.emailCode) {
      const ok = await this.verifyEmailCode(dto.email, dto.emailCode, 'register');
      if (!ok) throw new BusinessException(ErrorEnum.EMAIL_CODE_INVALID);
    } else if (dto.email && !dto.emailCode) {
      throw new BusinessException(ErrorEnum.EMAIL_CODE_INVALID);
    }

    const exists = await this.userRepo.findOne({ where: { username: dto.username } });
    if (exists) throw new BusinessException(ErrorEnum.USER_EXISTS);

    const defaultRole = await this.roleRepo.findOne({ where: { code: 'user' } });

    const created = await this.dataSource.transaction(async (em) => {
      const u = em.create(UserEntity, {
        username: dto.username,
        nickname: dto.nickname,
        email: dto.email,
        phone: dto.phone,
        status: 1,
        pv: 1,
      });
      u.salt = makeSalt(0);
      u.password = encryptPassword(dto.password, u.salt);
      const saved = await em.save(u);
      saved.salt = makeSalt(saved.id);
      saved.password = encryptPassword(dto.password, saved.salt);
      await em.save(saved);

      if (defaultRole) {
        await em.save(
          em.create(SysUserRoleEntity, { userId: saved.id, roleId: defaultRole.id }),
        );
      }
      return saved;
    });

    const roles = defaultRole ? [defaultRole.code] : [];
    const perms = await this.loadUserPerms(created.id, roles);
    return this.buildUserInfo(created, roles, perms);
  }

  async refresh(refreshToken: string): Promise<ITokenPairResponse> {
    let payload: any;
    try {
      payload = this.jwtToken.verifyRefresh(refreshToken);
    } catch {
      throw new BusinessException(ErrorEnum.TOKEN_INVALID);
    }
    if (payload?.typ !== 'refresh') {
      throw new BusinessException(ErrorEnum.TOKEN_INVALID);
    }

    const uid = payload.uid;
    const pv = payload.pv;
    const oldJti = payload.jti;

    const saved = await this.redis.get(genRefreshTokenKey(uid, oldJti));
    if (!saved || saved !== refreshToken) {
      throw new BusinessException(ErrorEnum.TOKEN_INVALID);
    }
    const pvSaved = await this.redis.get(genPasswordVersionKey(uid));
    if (pvSaved && Number(pvSaved) !== pv) {
      throw new BusinessException(ErrorEnum.PASSWORD_VERSION_EXPIRED);
    }

    const roleLinks = await this.userRoleRepo.find({ where: { userId: uid } });
    const roleIds = roleLinks.map((r) => r.roleId);
    const roles = roleIds.length
      ? (await this.roleRepo.find({ where: { id: In(roleIds), status: 1 } })).map((r) => r.code)
      : [];

    await this.redis.set(genTokenBlacklistKey(oldJti), '1', this.twoHoursMs());
    await this.redis.del(genRefreshTokenKey(uid, oldJti));

    const user = await this.userRepo.findOne({ where: { id: uid } });
    if (!user) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);
    if (user.status === 0) throw new BusinessException(ErrorEnum.USER_DISABLED);

    const pair = this.jwtToken.signPair({ uid: user.id, pv: user.pv, roles });
    const accessJti = this.extractJti(pair.accessToken);
    const refreshJti = this.extractJti(pair.refreshToken);

    await this.redis.set(genTokenKey(user.id, accessJti), pair.accessToken, pair.accessExpiresIn * 1000);
    await this.redis.set(genRefreshTokenKey(user.id, refreshJti), pair.refreshToken, pair.refreshExpiresIn * 1000);

    await this.accessRepo.save(
      this.accessRepo.create({
        uid: user.id,
        jti: accessJti,
        token: pair.accessToken,
        expiresAt: new Date(Date.now() + pair.accessExpiresIn * 1000),
      }),
    );
    await this.refreshRepo.save(
      this.refreshRepo.create({
        uid: user.id,
        jti: refreshJti,
        token: pair.refreshToken,
        expiresAt: new Date(Date.now() + pair.refreshExpiresIn * 1000),
      }),
    );

    return pair;
  }

  async logout(uid: number, jti: string, refreshJti?: string): Promise<void> {
    await this.redis.set(genTokenBlacklistKey(jti), '1', this.twoHoursMs());
    await this.redis.del(genTokenKey(uid, jti));
    if (refreshJti) {
      await this.redis.del(genRefreshTokenKey(uid, refreshJti));
    }
    await this.redis.srem(genOnlineUserSetKey(), String(uid));
    await this.redis.del(genOnlineUserKey(uid));
    await this.redis.del(genPermKey(uid));
  }

  async updatePassword(
    uid: number,
    dto: UpdatePasswordDto,
    meta: { ip?: string },
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: uid } });
    if (!user) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);
    if (!checkPassword(dto.oldPassword, user.salt, user.password)) {
      throw new BusinessException(ErrorEnum.USER_PASSWORD_ERROR);
    }
    const newSalt = makeSalt(user.id);
    const newHashed = encryptPassword(dto.newPassword, newSalt);
    const newPv = user.pv + 1;
    await this.userRepo.update(user.id, {
      password: newHashed,
      salt: newSalt,
      pv: newPv,
    });
    await this.redis.set(genPasswordVersionKey(user.id), String(newPv));
    await this.redis.del(genPermKey(user.id));
    this.logger.log(`user[${user.id}] password updated, pv=${newPv} ip=${meta.ip ?? '-'}`);
  }

  async sendEmailCode(dto: EmailCodeDto): Promise<{ ttl: number }> {
    const scene = dto.scene ?? 'login';
    const code = emailCodeGen();
    const ttl = 5 * 60;
    await this.redis.set(genCaptchaEmailKey(`${scene}:${dto.email}`), code, ttl * 1000);
    const html = `<p>您的验证码是 <b style="font-size:20px">${code}</b>，5 分钟内有效，请勿泄露给他人。</p>`;
    const ok = await this.mailer.send(dto.email, `【Nest-Admin-Pro】${scene} 验证码`, html);
    const mailHost = this.config.get<string>('mail.host');
    const mailUser = this.config.get<string>('mail.user');
    const mailConfigured = !!mailHost && !!mailUser;
    if (!ok && mailConfigured) {
      throw new BusinessException(ErrorEnum.MAIL_SEND_FAILED);
    }
    if (!ok) {
      this.logger.warn(`[DEV email-code] scene=${scene} email=${dto.email} code=${code} ttl=${ttl}s`);
    }
    return { ttl };
  }

  async getUserInfo(uid: number): Promise<IUserInfo> {
    const user = await this.userRepo.findOne({ where: { id: uid } });
    if (!user) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    const roleLinks = await this.userRoleRepo.find({ where: { userId: uid } });
    const roleIds = roleLinks.map((r) => r.roleId);
    const roles = roleIds.length
      ? (await this.roleRepo.find({ where: { id: In(roleIds), status: 1 } })).map((r) => r.code)
      : [];

    const perms = await this.loadUserPerms(uid, roles);
    await this.redis.set(genPermKey(uid), JSON.stringify(perms), CACHE_TTL.ONE_HOUR * 1000);

    return this.buildUserInfo(user, roles, perms);
  }

  private async loadUserPerms(uid: number, roles: string[]): Promise<string[]> {
    if (roles.includes(this.adminRole)) {
      return ['*:*:*'];
    }
    if (roles.length === 0) return [];
    const roleEntities = await this.roleRepo.find({ where: { code: In(roles) } });
    const roleIds = roleEntities.map((r) => r.id);
    if (roleIds.length === 0) return [];
      const menus = await this.dataSource.query(
        `SELECT DISTINCT m.perms FROM sys_menu m
        INNER JOIN sys_role_menu rm ON rm.\`menuId\` = m.\`id\`
        WHERE rm.\`roleId\` IN (${roleIds.map(() => '?').join(',')})
          AND m.\`status\` = 1 AND m.\`perms\` IS NOT NULL AND m.\`perms\` <> ''`,
        roleIds,
      );
    const set = new Set<string>();
    for (const row of menus) {
      const p = (row as any).perms as string;
      if (p) set.add(p);
    }
    return [...set];
  }

  private async buildUserInfo(
    user: UserEntity,
    roles: string[],
    perms: string[],
  ): Promise<IUserInfo> {
    const menus = await this.loadUserMenus(user.id, roles);
    return {
      uid: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      roles,
      permissions: perms,
      menus,
      deptId: user.deptId,
    };
  }

  private async loadUserMenus(uid: number, roles: string[]): Promise<IMenuItem[]> {
    let list: MenuEntity[];
    if (roles.includes(this.adminRole)) {
      list = await this.menuRepo.find({ where: { status: 1 }, order: { sort: 'ASC' } });
    } else {
      if (roles.length === 0) return [];
      const rows = await this.dataSource.query(
        `SELECT DISTINCT m.* FROM sys_menu m
         INNER JOIN sys_role_menu rm ON rm.\`menuId\` = m.\`id\`
         INNER JOIN sys_role r ON r.\`id\` = rm.\`roleId\`
         WHERE r.\`code\` IN (${roles.map(() => '?').join(',')})
           AND m.\`status\` = 1
           AND m.\`type\` IN (1,2)
         ORDER BY m.\`sort\` ASC`,
        roles,
      );
      list = (rows as any[]).map((r) => this.menuRepo.create(r as MenuEntity));
    }
    return this.toTree(list);
  }

  private toTree(list: MenuEntity[]): IMenuItem[] {
    const map = new Map<number, IMenuItem>();
    const roots: IMenuItem[] = [];
    for (const m of list) {
      map.set(m.id, {
        id: m.id,
        parentId: m.parentId ?? 0,
        name: m.name,
        title: m.name,
        path: m.path ?? '',
        component: m.component ?? undefined,
        icon: m.icon ?? undefined,
        type: m.type,
        perm: m.perms ?? undefined,
        sort: m.sort,
        hide: !!m.hide,
      });
    }
    for (const item of map.values()) {
      if (item.parentId && map.has(item.parentId)) {
        const p = map.get(item.parentId);
        if (p) {
          p.children = p.children ?? [];
          p.children.push(item);
        }
      } else {
        roots.push(item);
      }
    }
    return roots;
  }

  private async markOnline(
    uid: number,
    jti: string,
    meta: { ip?: string; ua?: string },
  ): Promise<void> {
    const payload = { jti, ip: meta.ip, ua: meta.ua, loginAt: Date.now() };
    await this.redis.set(genOnlineUserKey(uid), JSON.stringify(payload), CACHE_TTL.ONE_HOUR * 1000);
    await this.redis.sadd(genOnlineUserSetKey(), String(uid));
  }

  private extractJti(token: string): string {
    try {
      const payload = this.jwt.decode<{ jti: string }>(token);
      return payload?.jti ?? '';
    } catch {
      return '';
    }
  }

  private twoHoursMs(): number {
    return 2 * 60 * 60 * 1000;
  }
}
