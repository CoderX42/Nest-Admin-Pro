import md5 from 'md5';

/**
 * 规范要求：密码用 MD5 + 盐
 * 规则：md5(md5(password) + salt)
 */
export function encryptPassword(raw: string, salt: string): string {
  return md5(md5(raw) + salt);
}

export function makeSalt(uid: number): string {
  return `nap-${uid}`;
}

export function checkPassword(raw: string, salt: string, hashed: string): boolean {
  return encryptPassword(raw, salt) === hashed;
}
