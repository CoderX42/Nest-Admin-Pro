import { BadRequestException } from '@nestjs/common';
import { MenuService } from './menu.service';

describe('MenuService', () => {
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
