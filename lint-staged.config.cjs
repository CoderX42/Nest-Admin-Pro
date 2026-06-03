const path = require('node:path');

const quote = (value) => `"${value.replaceAll('"', '\\"')}"`;

const normalize = (file) => path.relative(process.cwd(), file).split(path.sep).join('/');

const eslintFiles = (files) => {
  const matched = files.map(normalize).filter((file) => !file.endsWith('.d.ts'));
  if (matched.length === 0) {
    return [];
  }

  return [`corepack pnpm exec eslint --max-warnings 0 ${matched.map(quote).join(' ')}`];
};

const checkMarkdown = (files) => {
  if (files.length === 0) {
    return [];
  }

  return `corepack pnpm exec prettier --check ${files.map(quote).join(' ')}`;
};

module.exports = {
  '*.{ts,vue}': eslintFiles,
  '*.json': (files) =>
    `node -e "const fs=require('node:fs'); for (const file of process.argv.slice(1)) JSON.parse(fs.readFileSync(file, 'utf8'));" ${files
      .map(quote)
      .join(' ')}`,
  '*.md': checkMarkdown,
};
