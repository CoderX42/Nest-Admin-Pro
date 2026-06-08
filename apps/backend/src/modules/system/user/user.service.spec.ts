import * as ExcelJS from 'exceljs';
import { BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';

describe('UserService import/export', () => {
  it('parses xlsx import rows into user create data', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Users');
    sheet.addRow(['用户名', '昵称', '密码', '邮箱', '手机号', '部门ID', '状态', '备注']);
    sheet.addRow(['alice', 'Alice', 'secret123', 'alice@example.com', '13800138000', 21, 1, 'hello']);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const service = new UserService({} as never, {} as never);

    await expect(service.parseImportWorkbook(buffer)).resolves.toEqual([
      {
        row: 2,
        username: 'alice',
        nickname: 'Alice',
        password: 'secret123',
        email: 'alice@example.com',
        phone: '13800138000',
        deptId: 21,
        status: 1,
        remark: 'hello',
      },
    ]);
  });

  it('rejects non-xlsx import files', async () => {
    const service = new UserService({} as never, {} as never);

    await expect(
      service.importUsers({
        originalname: 'users.csv',
        buffer: Buffer.from('username'),
      } as Express.Multer.File),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
