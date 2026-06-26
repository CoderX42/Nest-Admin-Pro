import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailLogEntity } from './entities/mail-log.entity';
import { MailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MailLogEntity])],
  controllers: [EmailController],
  providers: [MailService],
  exports: [MailService],
})
export class EmailModule {}
