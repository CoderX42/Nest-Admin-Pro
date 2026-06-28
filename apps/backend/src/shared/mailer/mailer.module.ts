import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';

@Global()
@Module({
  providers: [
    {
      provide: MailerService,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => new MailerService(cfg),
    },
  ],
  exports: [MailerService],
})
export class MailerModule {}
