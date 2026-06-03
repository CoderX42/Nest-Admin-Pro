const path = require('node:path');

const quote = (value) => `"${value.replaceAll('"', '\\"')}"`;

const normalize = (file) => file.split(path.sep).join('/');

const byPrefix = (files, prefix) =>
  files.map(normalize).filter((file) => file.startsWith(prefix));

const eslintFor = (scope, files) => {
  if (files.length === 0) {
    return [];
  }

  return [`pnpm --filter ${scope} exec eslint --max-warnings 0 ${files.map(quote).join(' ')}`];
};

module.exports = {
  '*.{ts,vue}': (files) => [
    ...eslintFor('backend', byPrefix(files, 'apps/backend/')),
    ...eslintFor('fronted', byPrefix(files, 'apps/fronted/')),
    ...eslintFor('app', byPrefix(files, 'apps/app/')),
  ],
  '*.json': (files) =>
    `node -e "const fs=require('node:fs'); for (const file of process.argv.slice(1)) JSON.parse(fs.readFileSync(file, 'utf8'));" ${files
      .map(quote)
      .join(' ')}`,
  '*.md': (files) =>
    `node -e "const fs=require('node:fs'); for (const file of process.argv.slice(1)) { if (!fs.existsSync(file)) process.exit(1); }" ${files
      .map(quote)
      .join(' ')}`,
};
