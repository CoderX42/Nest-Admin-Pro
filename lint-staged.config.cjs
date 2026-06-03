const path = require('node:path');

const quote = (value) => `"${value.replaceAll('"', '\\"')}"`;

const normalize = (file) => path.relative(process.cwd(), file).split(path.sep).join('/');

const byPrefix = (files, prefix) =>
  files.map(normalize).filter((file) => file.startsWith(prefix));

const checkFor = (scope, files, command) => {
  if (files.length === 0) {
    return [];
  }

  return [`corepack pnpm --filter ${scope} ${command}`];
};

module.exports = {
  '*.{ts,vue}': (files) => [
    ...checkFor('backend', byPrefix(files, 'apps/backend/'), 'build'),
    ...checkFor('fronted', byPrefix(files, 'apps/fronted/'), 'typecheck'),
    ...checkFor('app', byPrefix(files, 'apps/app/'), 'typecheck'),
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
