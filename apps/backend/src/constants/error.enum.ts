/**
 * 统一业务错误码（与 HTTP 200 一同返回，便于前端按业务逻辑判断）
 * 命名规则：模块:语义
 */
export enum ErrorEnum {
  // ===== 通用 1xxx =====
  SUCCESS = '0:success',
  FAIL = '1:fail',
  PARAMS_INVALID = '1001:参数校验失败',
  UNAUTHORIZED = '1002:未登录或登录已过期',
  FORBIDDEN = '1003:无权限访问',
  NOT_FOUND = '1004:资源不存在',
  METHOD_NOT_ALLOWED = '1005:请求方法不被允许',
  REQUEST_TIMEOUT = '1006:请求超时',
  TOO_MANY_REQUESTS = '1007:请求过于频繁',
  DEMO_MODE = '1008:演示模式禁止写入',
  IDEMPOTENCE_REPEAT = '1009:重复请求',

  // ===== 用户/认证 2xxx =====
  USER_NOT_FOUND = '2001:用户不存在',
  USER_PASSWORD_ERROR = '2002:账号或密码错误',
  USER_DISABLED = '2003:账号已被禁用',
  USER_EXISTS = '2004:账号已存在',
  CAPTCHA_INVALID = '2005:验证码错误或已过期',
  EMAIL_CODE_INVALID = '2006:邮箱验证码错误',
  TOKEN_INVALID = '2007:令牌无效',
  TOKEN_EXPIRED = '2008:令牌已过期',
  PASSWORD_VERSION_EXPIRED = '2009:密码已变更，请重新登录',

  // ===== 角色/权限 3xxx =====
  ROLE_NOT_FOUND = '3001:角色不存在',
  ROLE_ROOT_FORBID_DELETE = '3002:不允许删除超级管理员角色',
  ROLE_CODE_EXISTS = '3003:角色编码已存在',
  PERMISSION_DENIED = '3004:无访问权限',

  // ===== 菜单/部门 4xxx =====
  MENU_NOT_FOUND = '4001:菜单不存在',
  MENU_HAS_CHILDREN = '4002:存在子菜单，无法删除',
  DEPT_NOT_FOUND = '4101:部门不存在',
  DEPT_HAS_USERS = '4102:部门下存在用户，无法删除',
  DEPT_HAS_CHILDREN = '4103:存在下级部门，无法删除',

  // ===== 字典/参数 5xxx =====
  DICT_TYPE_NOT_FOUND = '5001:字典类型不存在',
  DICT_TYPE_EXISTS = '5002:字典类型已存在',
  PARAM_CONFIG_NOT_FOUND = '5101:参数不存在',
  PARAM_CONFIG_KEY_EXISTS = '5102:参数键已存在',

  // ===== 文件 6xxx =====
  FILE_EMPTY = '6001:文件为空',
  FILE_TYPE_INVALID = '6002:文件类型不允许',
  FILE_TOO_LARGE = '6003:文件超出大小限制',
  FILE_NOT_FOUND = '6004:文件不存在',

  // ===== 日志 8xxx =====
  LOGIN_LOG_NOT_FOUND = '8001:登录日志不存在',
  OPER_LOG_NOT_FOUND = '8101:操作日志不存在',

  // ===== 任务/邮件 7xxx =====
  TASK_NOT_FOUND = '7001:任务不存在',
  TASK_RUN_FAILED = '7002:任务执行失败',
  MAIL_SEND_FAILED = '7101:邮件发送失败',

  // ===== 通用兜底 =====
  INTERNAL = '9999:服务异常，请稍后再试',
}

/** HTTP 状态码映射（仅在抛 NestJS HttpException 时使用；业务异常统一 200） */
export const HttpStatusMap: Record<string, number> = {
  [ErrorEnum.SUCCESS]: 200,
  [ErrorEnum.PARAMS_INVALID]: 422,
  [ErrorEnum.UNAUTHORIZED]: 401,
  [ErrorEnum.FORBIDDEN]: 403,
  [ErrorEnum.NOT_FOUND]: 404,
  [ErrorEnum.METHOD_NOT_ALLOWED]: 405,
  [ErrorEnum.REQUEST_TIMEOUT]: 408,
  [ErrorEnum.TOO_MANY_REQUESTS]: 429,
  [ErrorEnum.TOKEN_EXPIRED]: 401,
  [ErrorEnum.TOKEN_INVALID]: 401,
  [ErrorEnum.INTERNAL]: 500,
};
