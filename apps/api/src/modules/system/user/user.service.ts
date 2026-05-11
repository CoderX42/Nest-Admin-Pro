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

    const where: any = { isDelete: 0 };
    if (username) where.username = { contains: username };
    if (nickname) where.nickname = { contains: nickname };
    if (status !== undefined) where.status = status;
    if (deptId) where.deptId = deptId;

    const [total, items] = await Promise.all([
      this.prisma.sysUser.count({ where }),
      this.prisma.sysUser.findMany({
        where,
        include: { dept: true, roles: true },
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
        roles: u.roles.map((r) => ({ id: r.id, name: r.name, code: r.code })),
      })),
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id, isDelete: 0 },
      include: { dept: true, roles: true, posts: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, password: undefined };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.sysUser.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new BadRequestException('Username already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.sysUser.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        nickname: dto.nickname,
        email: dto.email,
        phone: dto.phone,
        status: dto.status ?? 1,
        remark: dto.remark,
        deptId: dto.deptId,
        postIds: dto.postIds ? JSON.stringify(dto.postIds) : undefined,
      },
      select: { id: true, username: true },
    });
  }

  async update(dto: UpdateUserDto) {
    if (!dto.id) throw new BadRequestException('User ID is required');

    const user = await this.prisma.sysUser.findUnique({
      where: { id: dto.id, isDelete: 0 },
    });
    if (!user) throw new NotFoundException('User not found');

    const data: any = {
      nickname: dto.nickname,
      email: dto.email,
      phone: dto.phone,
      status: dto.status,
      remark: dto.remark,
      deptId: dto.deptId,
      postIds: dto.postIds ? JSON.stringify(dto.postIds) : undefined,
    };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.sysUser.update({
      where: { id: dto.id },
      data,
      select: { id: true, username: true },
    });
  }

  async remove(id: number) {
    await this.prisma.sysUser.update({
      where: { id },
      data: { isDelete: 1, deleteTime: new Date() },
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
    await this.prisma.sysUser.update({
      where: { id },
      data: {
        roles: { set: roleIds.map((rid) => ({ id: rid })) },
      },
    });
    return { success: true };
  }
}