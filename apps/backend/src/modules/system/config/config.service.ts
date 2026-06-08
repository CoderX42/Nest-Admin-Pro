import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { RedisService } from '../../../cache/redis.service';
import { CreateConfigDto, UpdateConfigDto, QueryConfigDto } from './dto/config.dto';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async list(query: QueryConfigDto) {
    const { configName, configKey, status, page = 1, limit = 10 } = query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (configName) where.name = { contains: configName };
    if (configKey) where.configKey = { contains: configKey };
    if (status !== undefined) where.status = status;
    const [total, items] = await Promise.all([
      this.prisma.sysConfig.count({ where }),
      this.prisma.sysConfig.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ]);
    return { total, items };
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
      data: { name: dto.configName, configKey: dto.configKey, configValue: dto.configValue, valueType: dto.configType ?? 'string', remark: dto.remark, status: dto.status ?? 1 },
    });
  }

  async update(dto: UpdateConfigDto) {
    const config = await this.prisma.sysConfig.findUnique({ where: { id: dto.id } });
    if (!config) throw new NotFoundException('Config not found');
    await this.prisma.sysConfig.update({ where: { id: dto.id }, data: { name: dto.configName, configValue: dto.configValue, valueType: dto.configType, status: dto.status, remark: dto.remark } });
    if (config.configKey && dto.configValue !== undefined) await this.redis.set(`config:${config.configKey}`, dto.configValue);
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
