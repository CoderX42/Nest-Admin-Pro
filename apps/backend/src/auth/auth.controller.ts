import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, CaptchaDto, UpdateProfileDto, UpdatePasswordDto } from './dto/auth.dto';
import { Public } from './guards';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Get('captcha')
  @ApiOperation({ summary: 'Get captcha' })
  async getCaptcha() {
    return this.authService.getCaptcha();
  }

  @Public()
  @Post('captcha/validate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validate captcha' })
  async validateCaptcha(@Body() dto: CaptchaDto) {
    const valid = await this.authService.validateCaptcha(dto.key, dto.text);
    return { valid };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'User logout' })
  async logout(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/info')
  @ApiOperation({ summary: 'Get current user info' })
  async getUserInfo(@Req() req: any) {
    return this.authService.getUserInfo(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('online/users')
  @ApiOperation({ summary: 'Get online users' })
  async getOnlineUsers() {
    return this.authService.getOnlineUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile/password')
  @ApiOperation({ summary: 'Change password' })
  async updatePassword(@Req() req: any, @Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.id, dto.oldPassword, dto.newPassword);
  }
}