import { BadRequestException } from '@nestjs/common';
import { DeptService } from './dept.service';

describe('DeptService', () => {
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
