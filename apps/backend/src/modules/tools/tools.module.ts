import { Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [StorageModule],
  exports: [StorageModule],
})
export class ToolsModule {}
