import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { RedisService } from '../../../cache/redis.service';
import { CreateConfigDto, UpdateConfigDto, QueryConfigDto } from './dto/config.dto';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async list(query: QueryConfigDto) {
    const { name, key, status } = query;
    const where: any = { deletedAt: null };
    if (name) where.name = { contains: name };
    if (key) where.configKey = { contains: key };
    if (status !== undefined) where.status = status;
    return this.prisma.sysConfig.findMany({ where, orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const config = await this.prisma.sysConfig.findUnique({ where: { id } });
    if (!config) throw new NotFoundException('Config not found');
    return config;
  }

  async findByKey(key: string) {
    const config = await this.prisma.sysConfig.findUnique({ where: { configKey: key } });
    if (!config) throw new NotFoundException('Config not found');
    return config;
  }

  async create(dto: CreateConfigDto) {
    return this.prisma.sysConfig.create({
      data: { name: dto.name, configKey: dto.key, configValue: dto.value, valueType: dto.type ?? 'string', remark: dto.remark, status: dto.status ?? 1 },
    });
  }

  async update(dto: UpdateConfigDto) {
    const config = await this.prisma.sysConfig.findUnique({ where: { id: dto.id } });
    if (!config) throw new NotFoundException('Config not found');
    await this.prisma.sysConfig.update({ where: { id: dto.id }, data: { name: dto.name, configValue: dto.value, valueType: dto.type, status: dto.status, remark: dto.remark } });
    if (config.configKey) await this.redis.set(`config:${config.configKey}`, dto.value);
  }

  async remove(id: number) {
    await this.prisma.sysConfig.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  async refresh() {
    const configs = await this.prisma.sysConfig.findMany({ where: { status: 1 } });
    for (const c of configs) {
      await this.redis.set(`config:${c.configKey}`, c.configValue);
    }
    return { success: true, count: configs.length };
  }
}
