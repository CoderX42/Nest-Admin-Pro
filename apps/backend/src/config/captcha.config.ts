import { registerAs } from '@nestjs/config';

export default registerAs('captcha', () => ({
  imgTtl: 300, // 秒
  imgSize: 4,
  imgNoise: 2,
  emailTtl: 300,
}));
