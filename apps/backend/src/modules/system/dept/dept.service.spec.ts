import { BadRequestException } from '@nestjs/common';
import { DeptService } from './dept.service';

describe('DeptService', () => {
  it('excludes placeholder root when building department tree', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 0n, parentId: 0n, name: 'Root', sort: 0 },
      { id: 1n, parentId: 0n, name: '平台总部', sort: 1 },
      { id: 2n, parentId: 0n, name: '演示总公司', sort: 1 },
      { id: 21n, parentId: 2n, name: '技术部', sort: 1 },
      { id: 211n, parentId: 21n, name: '前端组', sort: 1 },
    ]);
    const service = new DeptService({
      sysDept: { findMany },
    } as never);

    const tree = await service.list({});

    expect(findMany).toHaveBeenCalledWith({
      where: { id: { not: 0 } },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
    expect(tree.map((dept) => Number(dept.id))).toEqual([1, 2]);
    expect(tree[1]?.children?.[0]?.children?.[0]?.name).toBe('前端组');
  });

  it('builds department tree when placeholder root is absent', async () => {
    const service = new DeptService({
      sysDept: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1n, parentId: 0n, name: '平台总部', sort: 1 },
          { id: 2n, parentId: 0n, name: '演示总公司', sort: 1 },
          { id: 21n, parentId: 2n, name: '技术部', sort: 1 },
        ]),
      },
    } as never);

    const tree = await service.list({});

    expect(tree).toHaveLength(2);
    expect(tree[1]?.children?.[0]?.name).toBe('技术部');
  });

  it('throws BadRequestException when removing a department with children', async () => {
    const service = new DeptService({
      sysDept: {
        count: jest.fn().mockResolvedValue(1),
        delete: jest.fn(),
      },
    } as never);

    await expect(service.remove(1)).rejects.toBeInstanceOf(BadRequestException);
  });
});
