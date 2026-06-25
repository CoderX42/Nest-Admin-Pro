import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '账号', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  username: string;

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 64)
  password: string;

  @ApiPropertyOptional({ description: '图形验证码 ID（captcha 接口返回）' })
  @IsOptional()
  @IsString()
  captchaId?: string;

  @ApiPropertyOptional({ description: '图形验证码文本' })
  @IsOptional()
  @IsString()
  captchaCode?: string;
}
