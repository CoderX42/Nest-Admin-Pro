export const DICT_KEYS = {
  sysNormalDisable: 'sys_normal_disable',
  sysUserSex: 'sys_user_sex',
  sysShowHide: 'sys_show_hide',
  sysYesNo: 'sys_yes_no',
  sysNoticeType: 'sys_notice_type',
  sysOperType: 'sys_oper_type',
} as const;

export type DictKey = (typeof DICT_KEYS)[keyof typeof DICT_KEYS];
