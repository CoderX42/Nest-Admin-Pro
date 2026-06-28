import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { UpdatePasswordDto } from './dto/password.dto';
import { EmailCodeDto } from './dto/email-code.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Perm } from '@/common/decorators/perm.decorator';
import { CurrentUser, IAuthUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Auth - 认证')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('captcha')
  @ApiOperation({ summary: '获取图形验证码（公开）' })
  async captcha() {
    return this.auth.generateCaptcha();
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '账号登录（公开）' })
  async login(@Body() dto: LoginDto, @Req() req: FastifyRequest) {
    const meta = this.extractMeta(req);
    return this.auth.login(dto, meta);
  }

  @Public()
  @Post('register')
  @HttpCode(200)
  @ApiOperation({ summary: '用户注册（公开）' })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('email-code')
  @HttpCode(200)
  @ApiOperation({ summary: '发送邮箱验证码（公开）' })
  async emailCode(@Body() dto: EmailCodeDto) {
    return this.auth.sendEmailCode(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '刷新 access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(200)
  @Perm('auth:logout')
  @ApiOperation({ summary: '登出（注销当前 token）' })
  async logout(@CurrentUser() user: IAuthUser, @Req() req: FastifyRequest) {
    const refreshJti = this.extractRefreshJti(req);
    await this.auth.logout(user.uid, user.jti, refreshJti);
    return { message: '已登出' };
  }

  @ApiBearerAuth()
  @Post('password')
  @HttpCode(200)
  @Perm('auth:password')
  @ApiOperation({ summary: '修改自己的登录密码' })
  async updatePassword(
    @CurrentUser() user: IAuthUser,
    @Body() dto: UpdatePasswordDto,
    @Req() req: FastifyRequest,
  ) {
    const meta = this.extractMeta(req);
    await this.auth.updatePassword(user.uid, dto, meta);
    return { message: '密码已修改，请重新登录' };
  }

  @ApiBearerAuth()
  @Get('me')
  @Perm('auth:me')
  @ApiOperation({ summary: '获取当前登录用户信息（含权限/菜单）' })
  async me(@CurrentUser() user: IAuthUser) {
    return this.auth.getUserInfo(user.uid);
  }

  private extractMeta(req: FastifyRequest): { ip?: string; ua?: string } {
    const headers = req.headers ?? {};
    const xff = headers['x-forwarded-for'];
    const ip =
      (Array.isArray(xff) ? xff[0] : xff?.split(',')[0]?.trim()) ||
      (req as any).ip ||
      '0.0.0.0';
    const ua = Array.isArray(headers['user-agent'])
      ? headers['user-agent'][0]
      : headers['user-agent'];
    return { ip, ua };
  }

  private extractRefreshJti(req: FastifyRequest): string | undefined {
    const raw = req.headers?.['x-refresh-jti'];
    if (!raw) return undefined;
    return Array.isArray(raw) ? raw[0] : raw;
  }
}
