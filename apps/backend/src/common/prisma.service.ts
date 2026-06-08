import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { dataScopeMiddleware } from './prisma/data-scope.middleware';
import { tenantMiddleware } from './prisma/tenant.middleware';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
    });
    this.$use(tenantMiddleware);
    this.$use(dataScopeMiddleware(this));
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
