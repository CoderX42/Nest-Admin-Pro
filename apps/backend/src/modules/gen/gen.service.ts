import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class GenService {
  constructor(private prisma: PrismaService) {}

  async tableList(query: { page?: number; limit?: number; tableName?: string }) {
    const { page = 1, limit = 10, tableName } = query;
    const where: any = {};
    if (tableName) where.tableName = { contains: tableName };
    const [total, items] = await Promise.all([
      this.prisma.genTable.count({ where }),
      this.prisma.genTable.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' } }),
    ]);
    return { total, items };
  }

  async tableFindOne(id: number) {
    const table = await this.prisma.genTable.findUnique({ where: { id }, include: { fields: { orderBy: { sort: 'asc' } } } });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  async tableCreate(dto: any) {
    return this.prisma.genTable.create({
      data: {
        tableName: dto.tableName, tableComment: dto.tableComment, moduleName: dto.moduleName,
        businessName: dto.businessName, className: dto.entityName ?? dto.className,
        functionName: dto.functionName ?? dto.businessName, author: dto.author,
        tplCategory: dto.tplCategory ?? 'crud',
      },
    });
  }

  async tableUpdate(dto: any) {
    return this.prisma.genTable.update({ where: { id: dto.id }, data: dto });
  }

  async tableDelete(id: number) {
    await this.prisma.genTableField.deleteMany({ where: { tableId: id } });
    await this.prisma.genTable.delete({ where: { id } });
    return { success: true };
  }

  async columnList(tableId: number) {
    return this.prisma.genTableField.findMany({ where: { tableId }, orderBy: { sort: 'asc' } });
  }

  async syncColumns(tableId: number) {
    // In production, this would read actual DB schema
    return { success: true, message: 'Columns synced (stub)' };
  }

  async generate(tableId: number) {
    const table = await this.tableFindOne(tableId);
    // Generate backend and frontend code as zip
    const code = this.buildCode(table);
    return { success: true, code };
  }

  async preview(tableId: number) {
    const table = await this.tableFindOne(tableId);
    return {
      backend: this.buildBackendFiles(table),
      frontend: this.buildFrontendFiles(table),
    };
  }

  private buildCode(table: any) {
    const entityName = table.className;
    return {
      backend: [
        `${entityName.toLowerCase()}.controller.ts`,
        `${entityName.toLowerCase()}.service.ts`,
        `dto/create-${entityName.toLowerCase()}.dto.ts`,
        `dto/update-${entityName.toLowerCase()}.dto.ts`,
        `entities/${entityName.toLowerCase()}.entity.ts`,
      ],
      frontend: [
        `index.vue`,
        `components/${entityName}Form.vue`,
        `api/${entityName.toLowerCase()}.ts`,
      ],
    };
  }

  private buildBackendFiles(table: any) {
    const entity = table.className;
    const lcEntity = entity.charAt(0).toLowerCase() + entity.slice(1);
    return {
      controller: `import { Controller } from '@nestjs/common';\nimport { ApiTags } from '@nestjs/swagger';\nimport { ${entity}Service } from './${lcEntity}.service';\n\n@ApiTags('${table.businessName}')\n@Controller('${table.moduleName}/${lcEntity}')\nexport class ${entity}Controller {\n  constructor(private readonly service: ${entity}Service) {}\n}`,
      service: `import { Injectable } from '@nestjs/common';\nimport { PrismaService } from '../common/prisma.service';\n\n@Injectable()\nexport class ${entity}Service {\n  constructor(private prisma: PrismaService) {}\n}`,
    };
  }

  private buildFrontendFiles(table: any) {
    const entity = table.className;
    const lcEntity = entity.charAt(0).toLowerCase() + entity.slice(1);
    return {
      indexVue: `<template>\n  <div class="${lcEntity}">\n    <!-- ${table.businessName} List -->\n  </div>\n</template>\n\n<script setup lang="ts">\n// ${table.author}\n</script>`,
    };
  }
}
