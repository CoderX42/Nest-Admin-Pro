import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

describe('AuthService JWT payload', () => {
  const secret = 'test-secret-with-enough-length';

  it('signs BigInt users with a JSON-safe payload and validates the token payload', async () => {
    const jwtService = new JwtService({ secret });
    const user = {
      id: 1n,
      tenantId: 1n,
      username: 'admin',
      password: bcrypt.hashSync('admin123', 10),
      nickname: '超级管理员',
      avatar: '',
      email: null,
      phone: null,
      status: 1,
      isPlatformAdmin: 1,
      deptId: 1n,
      dept: { name: '平台总部' },
      userRoles: [{ role: { id: 1n, name: '超级管理员', code: 'platform_admin', roleMenus: [] } }],
    };
    const prisma = {
      sysUser: {
        findFirst: jest.fn().mockResolvedValue(user),
      },
      sysLoginLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      sysMenu: {
        findMany: jest.fn().mockResolvedValue([{ perms: 'system:user:list' }]),
      },
    };
    const redis = {
      get: jest.fn().mockResolvedValue('abcd'),
      del: jest.fn().mockResolvedValue(undefined),
      setOnlineUser: jest.fn().mockResolvedValue(undefined),
    };
    const configService = { get: jest.fn().mockReturnValue(secret) };
    const authService = new AuthService(
      prisma as never,
      jwtService,
      configService as never,
      redis as never,
    );
    const strategy = new JwtStrategy(configService as never, prisma as never);

    const loginResult = await authService.login({
      username: 'admin',
      password: 'admin123',
      captchaKey: 'captcha:test',
      captchaText: 'abcd',
    });
    const decoded = jwtService.verify(loginResult.token);

    expect(decoded.sub).toBe('1');
    expect(decoded.tenantId).toBe('1');
    expect(decoded.isPlatformAdmin).toBe(true);
    await expect(strategy.validate(decoded)).resolves.toMatchObject({
      id: 1n,
      username: 'admin',
      permissions: ['system:user:list'],
    });
  });
});
