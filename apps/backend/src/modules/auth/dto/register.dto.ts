import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: '账号', example: 'newuser' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  username: string;

  @ApiProperty({ description: '密码', example: 'abc12345' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  password: string;

  @ApiProperty({ description: '昵称', example: '小张' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  nickname: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱验证码（如果传了 email 则必填）' })
  @IsOptional()
  @IsString()
  emailCode?: string;
}
