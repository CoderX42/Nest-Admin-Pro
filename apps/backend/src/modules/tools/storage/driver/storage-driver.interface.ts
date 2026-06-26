/**
 * 文件存储驱动抽象接口
 * - 不同驱动（本地磁盘 / 七牛云 / 阿里云 / S3 …）实现相同契约
 * - 控制器与 Service 只依赖该接口，驱动按配置注入
 */
export interface UploadResult {
  /** 访问 URL（前端可拼接/直接展示） */
  url: string;
  /** 存储路径（驱动内部使用，删除时回传） */
  path: string;
  /** 驱动名，便于落库与回显 */
  driver: string;
}

export interface StorageDriver {
  /** 驱动名（与 entity.driver 字段对应） */
  readonly name: string;

  /**
   * 将文件二进制写入底层存储
   * @param buffer   文件内容
   * @param filename 落盘文件名（已包含扩展名，由调用方生成唯一性）
   * @param mime     MIME 类型
   */
  upload(buffer: Buffer, filename: string, mime: string): Promise<UploadResult>;

  /**
   * 删除底层文件
   * @param path 驱动在 upload 时返回的 path
   */
  remove(path: string): Promise<void>;

  /**
   * 由 path 推导可访问 URL（用于下载/预览）
   */
  getUrl(path: string): string;
}

/** Nest 注入用的 token —— 运行时默认驱动的实现 */
export const STORAGE_DRIVER = Symbol('STORAGE_DRIVER');
