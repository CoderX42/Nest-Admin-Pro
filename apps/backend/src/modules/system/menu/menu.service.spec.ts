import { BadRequestException } from '@nestjs/common';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  it('builds a menu tree when a placeholder root menu exists', async () => {
    const service = new MenuService({
      sysMenu: {
        findMany: jest.fn().mockResolvedValue([
          { id: 0n, parentId: 0n, name: '__root__', sort: 0 },
          { id: 1n, parentId: 0n, name: '仪表盘', sort: 1 },
          { id: 2n, parentId: 0n, name: '系统管理', sort: 2 },
          { id: 21n, parentId: 2n, name: '用户管理', sort: 1 },
        ]),
      },
    } as never);

    await expect(service.tree()).resolves.toMatchObject([
      { id: 1n, children: [] },
      { id: 2n, children: [{ id: 21n, children: [] }] },
    ]);
  });

  it('builds a menu tree when no placeholder root menu exists', async () => {
    const service = new MenuService({
      sysMenu: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1n, parentId: 0n, name: '仪表盘', sort: 1 },
          { id: 2n, parentId: 0n, name: '系统管理', sort: 2 },
          { id: 21n, parentId: 2n, name: '用户管理', sort: 1 },
        ]),
      },
    } as never);

    await expect(service.tree()).resolves.toMatchObject([
      { id: 1n, children: [] },
      { id: 2n, children: [{ id: 21n, children: [] }] },
    ]);
  });

  it('throws BadRequestException when removing a menu with children', async () => {
    const service = new MenuService({
      sysMenu: {
        count: jest.fn().mockResolvedValue(1),
        delete: jest.fn(),
      },
    } as never);

    await expect(service.remove(1)).rejects.toBeInstanceOf(BadRequestException);
  });
});
