import { BadRequestException } from '@nestjs/common';
import { RoleService } from './role.service';

describe('RoleService data scope', () => {
  it('sets custom data scope and rewrites role departments', async () => {
    const transaction = jest.fn().mockResolvedValue([]);
    const service = new RoleService({
      sysRole: {
        findFirst: jest.fn().mockResolvedValue({ id: 2n, code: 'tenant_admin' }),
        update: jest.fn().mockReturnValue('update-role'),
      },
      sysRoleDept: {
        deleteMany: jest.fn().mockReturnValue('delete-role-depts'),
        createMany: jest.fn().mockReturnValue('create-role-depts'),
      },
      $transaction: transaction,
    } as never);

    await expect(service.setDataScope(2, { dataScope: 2, deptIds: ['21', '22'] })).resolves.toEqual({ success: true });

    expect(transaction).toHaveBeenCalledWith([
      'update-role',
      'delete-role-depts',
      'create-role-depts',
    ]);
  });

  it('requires deptIds for custom data scope', async () => {
    const service = new RoleService({} as never);

    await expect(service.setDataScope(2, { dataScope: 2 })).rejects.toBeInstanceOf(BadRequestException);
  });
});
