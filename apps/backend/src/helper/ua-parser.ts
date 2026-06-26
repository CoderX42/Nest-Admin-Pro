
/**
 * 极简 UA 解析（避免引入 ua-parser-js）。
 * 仅识别常见浏览器与操作系统。
 */
export interface ParsedUA {
  os: string;
  browser: string;
}

const OS_REGEX: Array<[RegExp, string]> = [
  [/Windows NT 10\.0/, 'Windows 10'],
  [/Windows NT 6\.3/, 'Windows 8.1'],
  [/Windows NT 6\.2/, 'Windows 8'],
  [/Windows NT 6\.1/, 'Windows 7'],
  [/Windows/, 'Windows'],
  [/Mac OS X/, 'macOS'],
  [/Android/, 'Android'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Linux/, 'Linux'],
];

const BROWSER_REGEX: Array<[RegExp, string]> = [
  [/Edg\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/Chrome\//, 'Chrome'],
  [/Firefox\//, 'Firefox'],
  [/Safari\//, 'Safari'],
  [/MicroMessenger/, 'WeChat'],
];

export function parseUA(ua?: string | null): ParsedUA {
  if (!ua) return { os: 'Unknown', browser: 'Unknown' };
  let os = 'Unknown';
  for (const [re, name] of OS_REGEX) {
    if (re.test(ua)) {
      os = name;
      break;
    }
  }
  let browser = 'Unknown';
  for (const [re, name] of BROWSER_REGEX) {
    if (re.test(ua)) {
      browser = name;
      break;
    }
  }
  return { os, browser };
}
