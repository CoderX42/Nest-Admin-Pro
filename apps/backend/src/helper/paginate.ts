import { SelectQueryBuilder } from 'typeorm';

export interface PageMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export class Pagination<E> {
  items: E[];
  meta: PageMeta;

  constructor(items: E[], meta: PageMeta) {
    this.items = items;
    this.meta = meta;
  }
}

export interface PaginateOptions {
  page?: number;
  pageSize?: number;
}

/**
 * TypeORM QueryBuilder 分页辅助
 */
export async function paginate<E>(
  qb: SelectQueryBuilder<E>,
  options: PaginateOptions = {},
): Promise<Pagination<E>> {
  const page = Math.max(1, Number(options.page ?? 1));
  const pageSize = Math.max(1, Math.min(500, Number(options.pageSize ?? 10)));
  const [items, total] = await qb
    .take(pageSize)
    .skip((page - 1) * pageSize)
    .getManyAndCount();
  return new Pagination<E>(items, {
    itemCount: items.length,
    totalItems: total,
    itemsPerPage: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    currentPage: page,
  });
}

/**
 * 兼容 Vben Admin 旧分页入参 page/limit
 */
export async function paginateLegacy<E>(
  qb: SelectQueryBuilder<E>,
  page = 1,
  pageSize = 10,
): Promise<Pagination<E>> {
  return paginate(qb, { page, pageSize });
}
