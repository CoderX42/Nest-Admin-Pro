
import { SetMetadata } from '@nestjs/common';

export const OPER_LOG_KEY = 'nest-admin:oper-log';

export interface OperLogMeta {
  /** 模块名（如 '用户管理'） */
  module: string;
  /** 操作摘要（如 '创建用户'） */
  action: string;
  /** 是否记录请求参数，默认 true */
  saveParams?: boolean;
  /** 是否记录响应结果，默认 false（避免写大对象） */
  saveResult?: boolean;
}

/**
 * 操作日志装饰器
 * 用法：@OperLog({ module: '用户管理', action: '创建用户' })
 * 必须配合 OperLogInterceptor 使用。
 */
export const OperLog = (meta: OperLogMeta) => SetMetadata(OPER_LOG_KEY, meta);
