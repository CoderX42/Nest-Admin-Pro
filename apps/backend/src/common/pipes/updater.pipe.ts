import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { IAuthUser } from '../decorators/current-user.decorator';

/**
 * 在 @Body(UpdaterPipe) 上注入当前用户 ID 到 updateBy
 */
@Injectable()
export class UpdaterPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' || value == null) return value;
    const user = (value as any).__user as IAuthUser | undefined;
    if (user?.uid) value.updateBy = user.uid;
    return value;
  }
}
