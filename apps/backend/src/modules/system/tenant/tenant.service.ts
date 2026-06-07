import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateTenantDto, QueryTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async list(query: QueryTenantDto) {
    const { name, code, status, page = 1, limit = 10 } = query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (name) where.name = { contains: name };
    if (code) where.code = { contains: code };
    if (status !== undefined) where.status = status;
    const [total, items] = await Promise.all([
      this.prisma.sysTenant.count({ where }),
      this.prisma.sysTenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ]);
    return { total, items };
  }

  async findOne(id: number) {
    const tenant = await this.prisma.sysTenant.findFirst({ where: { id, deletedAt: null } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.sysTenant.findUnique({ where: { code: dto.code } });
    if (existing && existing.deletedAt === null) throw new BadRequestException('Tenant code already exists');
    return this.prisma.sysTenant.create({
      data: {
        name: dto.name,
        code: dto.code,
        contactUser: dto.contactUser,
        contactPhone: dto.contactPhone,
        status: dto.status ?? 1,
        expireAt: dto.expireAt ? new Date(dto.expireAt) : undefined,
        maxUsers: dto.maxUsers ?? 100,
        packageCode: dto.packageCode,
        remark: dto.remark,
      },
    });
  }

  async update(dto: UpdateTenantDto) {
    const tenant = await this.prisma.sysTenant.findFirst({ where: { id: dto.id, deletedAt: null } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return this.prisma.sysTenant.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        contactUser: dto.contactUser,
        contactPhone: dto.contactPhone,
        status: dto.status,
        expireAt: dto.expireAt ? new Date(dto.expireAt) : undefined,
        maxUsers: dto.maxUsers,
        packageCode: dto.packageCode,
        remark: dto.remark,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.sysTenant.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }
}
