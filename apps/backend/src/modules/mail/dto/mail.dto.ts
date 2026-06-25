import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMailDto {
  @ApiProperty({ example: ['user@example.com'], description: '收件人邮箱列表' })
  @IsArray()
  @IsEmail({}, { each: true })
  to: string[];

  @ApiProperty({ example: 'Hello from Nest-Admin-Pro' })
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: '<h1>Hi</h1><p>This is a test email.</p>' })
  @IsString()
  html: string;

  @ApiProperty({ required: false, example: 'plain text fallback' })
  @IsOptional()
  @IsString()
  text?: string;
}

export class TestMailDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  to: string;
}
