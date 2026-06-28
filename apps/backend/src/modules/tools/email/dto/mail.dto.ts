import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class SendMailDto {
  @ApiProperty({ description: '收件人邮箱列表', example: ['a@x.com', 'b@x.com'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  to: string[];

  @ApiPropertyOptional({ description: '抄送' })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiPropertyOptional({ description: '密送' })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @ApiProperty({ description: '主题', example: '欢迎注册' })
  @IsString()
  @Length(1, 255)
  subject: string;

  @ApiProperty({ description: '正文', example: '这是一封测试邮件' })
  @IsString()
  @MaxLength(1000000)
  content: string;

  @ApiPropertyOptional({ description: '是否 HTML', default: false })
  @IsOptional()
  @IsBoolean()
  isHtml?: boolean;
}
