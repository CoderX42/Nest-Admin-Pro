import { BadRequestException } from '@nestjs/common';
import * as path from 'path';
import type { FileStorageConfig, FileStorageProvider } from './storage.types';

export function createStoredName(originalName: string) {
  const ext = path.extname(normalizeOriginalName(originalName)).toLowerCase();
  const random = Math.round(Math.random() * 1e9);
  return `${Date.now()}-${random}${ext}`;
}

export function createCloudObjectKey(originalName: string, prefix: string) {
  const cleanPrefix = (prefix || 'uploads').replace(/^\/+|\/+$/g, '');
  const now = new Date();
  const datePath = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('/');
  return [cleanPrefix, datePath, createStoredName(originalName)].filter(Boolean).join('/');
}

export function normalizeOriginalName(originalName: string) {
  if (!originalName) return originalName;

  const decoded = Buffer.from(originalName, 'latin1').toString('utf8');
  return looksLikeMojibake(originalName) && !looksLikeMojibake(decoded)
    ? decoded
    : originalName;
}

function looksLikeMojibake(value: string) {
  return /[ÃÂÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß]|æ|ä|å|ç|è|é|ï|ð|ñ|ò|ó|�/.test(value);
}

export function buildPublicUrl(publicUrl: string, key: string, fallback?: string) {
  if (publicUrl) {
    return `${publicUrl.replace(/\/+$/g, '')}/${key.replace(/^\/+/g, '')}`;
  }
  return fallback || key;
}

export function assertCloudConfig(config: FileStorageConfig, providerName: string) {
  if (!config.region || !config.bucket || !config.accessKeyId || !config.accessKeySecret) {
    throw new BadRequestException(`${providerName} config is incomplete`);
  }
}

export function normalizeStorageProvider(value: string): FileStorageProvider {
  const normalized = value.toLowerCase();
  if (normalized === 'oss') return 'aliyun-oss';
  if (
    normalized === 'local' ||
    normalized === 'aliyun-oss' ||
    normalized === 'tencent-cos' ||
    normalized === 'qiniu-kodo' ||
    normalized === 'huawei-obs'
  ) {
    return normalized;
  }
  return 'local';
}
