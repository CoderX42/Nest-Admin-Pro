import { customAlphabet } from 'nanoid';

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nano = customAlphabet(alphabet, 16);

export function genId(prefix = ''): string {
  return `${prefix}${nano()}`;
}

export function genCaptchaId(): string {
  return nano();
}

export function genUuid(): string {
  return nano();
}
