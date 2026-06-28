import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { IAuthUser } from '../decorators/current-user.decorator';
import { Request } from 'express';

/**
 * 在 @Body(CreatorPipe) 上注入当前用户 ID 到 createBy
 */
@Injectable()
export class CreatorPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' || value == null) return value;
    const req = value?.__req as Request | undefined;
    const user = (req as any)?.user as IAuthUser | undefined;
    if (user?.uid) value.createBy = user.uid;
    return value;
  }
}
