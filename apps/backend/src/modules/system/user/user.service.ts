import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'node:stream';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../../common/prisma.service';
import { RedisService } from '../../../cache/redis.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto/user.dto';

interface UserImportRow {
  row: number;
  username: string;
  nickname?: string;
  password?: string;
  email?: string;
  phone?: string;
  deptId?: number;
  status?: number;
  remark?: string;
}

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

  async importUsers(file: Express.Multer.File | undefined) {
    if (!file?.buffer) throw new BadRequestException('No file uploaded');
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('Only .xlsx files are supported');
    }

    const rows = await this.parseImportWorkbook(file.buffer);
    const errors: { row: number; message: string }[] = [];
    let successCount = 0;

    for (const row of rows) {
      try {
        await this.create({
          username: row.username,
          password: row.password ?? 'admin123',
          nickname: row.nickname,
          email: row.email,
          phone: row.phone,
          deptId: row.deptId,
          status: row.status,
          remark: row.remark,
        });
        successCount += 1;
      } catch (error) {
        errors.push({ row: row.row, message: error instanceof Error ? error.message : 'Import failed' });
      }
    }

    return { successCount, failCount: errors.length, errors };
  }

  async exportUsers(query: QueryUserDto) {
    const { username, nickname, status, deptId } = query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (username) where.username = { contains: username };
    if (nickname) where.nickname = { contains: nickname };
    if (status !== undefined) where.status = status;
    if (deptId) where.deptId = deptId;

    const users = await this.prisma.sysUser.findMany({
      where,
      include: { dept: true, userRoles: { include: { role: true } } },
      orderBy: { id: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Users');
    sheet.columns = [
      { header: '用户名', key: 'username', width: 20 },
      { header: '昵称', key: 'nickname', width: 20 },
      { header: '部门', key: 'dept', width: 20 },
      { header: '角色', key: 'roles', width: 28 },
      { header: '状态', key: 'status', width: 12 },
      { header: '创建时间', key: 'createdAt', width: 24 },
    ];
    for (const user of users) {
      sheet.addRow({
        username: user.username,
        nickname: user.nickname,
        dept: user.dept?.name ?? '',
        roles: user.userRoles.map((userRole) => userRole.role.name).join(','),
        status: user.status === 1 ? '启用' : '禁用',
        createdAt: user.createdAt.toISOString(),
      });
    }
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async parseImportWorkbook(buffer: Buffer): Promise<UserImportRow[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.read(Readable.from(buffer));
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('Workbook has no worksheet');

    const rows: UserImportRow[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const username = this.cellValue(row.getCell(1).value);
      if (!username) return;
      rows.push({
        row: rowNumber,
        username,
        nickname: this.cellValue(row.getCell(2).value) || undefined,
        password: this.cellValue(row.getCell(3).value) || undefined,
        email: this.cellValue(row.getCell(4).value) || undefined,
        phone: this.cellValue(row.getCell(5).value) || undefined,
        deptId: this.cellNumber(row.getCell(6).value),
        status: this.cellNumber(row.getCell(7).value),
        remark: this.cellValue(row.getCell(8).value) || undefined,
      });
    });
    return rows;
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

  private cellValue(value: ExcelJS.CellValue) {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
      if ('text' in value && typeof value.text === 'string') return value.text.trim();
      if ('result' in value) return this.cellValue(value.result as ExcelJS.CellValue);
      if ('richText' in value && Array.isArray(value.richText)) {
        return value.richText.map((item) => item.text).join('').trim();
      }
      return String(value).trim();
    }
    return String(value).trim();
  }

  private cellNumber(value: ExcelJS.CellValue) {
    const text = this.cellValue(value);
    if (!text) return undefined;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
