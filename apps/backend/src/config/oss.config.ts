import { registerAs } from '@nestjs/config';

export default registerAs('oss', () => ({
  accessKey: process.env.OSS_ACCESSKEY ?? '',
  secretKey: process.env.OSS_SECRETKEY ?? '',
  domain: process.env.OSS_DOMAIN ?? '',
  bucket: process.env.OSS_BUCKET ?? '',
  zone: process.env.OSS_ZONE ?? 'z0',
}));
