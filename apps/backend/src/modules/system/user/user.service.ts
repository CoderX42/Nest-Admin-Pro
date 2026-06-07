import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { RedisService } from '../../../cache/redis.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async list(query: QueryUserDto) {
    const { username, nickname, status, deptId, page = 1, limit = 10 } = query;

    const where: any = { deletedAt: null };
    if (username) where.username = { contains: username };
    if (nickname) where.nickname = { contains: nickname };
    if (status !== undefined) where.status = status;
    if (deptId) where.deptId = deptId;

    const [total, items] = await Promise.all([
      this.prisma.sysUser.count({ where }),
      this.prisma.sysUser.findMany({
        where,
        include: { dept: true, userRoles: { include: { role: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
    ]);

    return {
      total,
      items: items.map((u) => ({
        ...u,
        password: undefined,
        roles: u.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name, code: ur.role.code })),
      })),
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.sysUser.findFirst({
      where: { id, deletedAt: null },
      include: { dept: true, userRoles: { include: { role: true } }, userPosts: { include: { post: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, password: undefined };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.sysUser.findFirst({
      where: { username: dto.username, tenantId: null, deletedAt: null },
    });
    if (existing) throw new BadRequestException('Username already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.sysUser.create({
      data: {
        tenantId: null,
        username: dto.username,
        password: hashedPassword,
        nickname: dto.nickname ?? '',
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        status: dto.status ?? 1,
        remark: dto.remark ?? null,
        deptId: dto.deptId ?? null,
      },
      select: { id: true, username: true },
    });
    if (dto.postIds?.length) {
      await this.prisma.sysUserPost.createMany({
        data: dto.postIds.map((postId) => ({ userId: user.id, postId: BigInt(postId) })),
      });
    }
    return user;
  }

  async update(dto: UpdateUserDto) {
    if (!dto.id) throw new BadRequestException('User ID is required');

    const user = await this.prisma.sysUser.findFirst({
      where: { id: dto.id, deletedAt: null },
    });
    if (!user) throw new NotFoundException('User not found');

    const data: any = {
      nickname: dto.nickname,
      email: dto.email,
      phone: dto.phone,
      status: dto.status,
      remark: dto.remark,
      deptId: dto.deptId,
    };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.sysUser.update({
      where: { id: dto.id },
      data,
      select: { id: true, username: true },
    });
    if (dto.postIds) {
      await this.prisma.$transaction([
        this.prisma.sysUserPost.deleteMany({ where: { userId: BigInt(dto.id) } }),
        this.prisma.sysUserPost.createMany({
          data: dto.postIds.map((postId) => ({ userId: BigInt(dto.id), postId: BigInt(postId) })),
        }),
      ]);
    }
    return updated;
  }

  async remove(id: number) {
    await this.prisma.sysUser.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  async resetPassword(id: number) {
    const newPassword = 'admin123'; // Default reset password
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.sysUser.update({
      where: { id },
      data: { password: hashed },
    });
    return { password: newPassword };
  }

  async changeStatus(id: number, status: number) {
    await this.prisma.sysUser.update({
      where: { id },
      data: { status },
    });
    return { success: true };
  }

  async assignRoles(id: number, roleIds: number[]) {
    await this.prisma.$transaction([
      this.prisma.sysUserRole.deleteMany({ where: { userId: BigInt(id) } }),
      this.prisma.sysUserRole.createMany({
        data: roleIds.map((roleId) => ({ userId: BigInt(id), roleId: BigInt(roleId) })),
      }),
    ]);
    return { success: true };
  }
}
