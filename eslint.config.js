const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const vue = require('eslint-plugin-vue');
const vueParser = require('vue-eslint-parser');

module.exports = [
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.output/**',
      '**/.vite/**',
      '**/uni_modules/**',
      '**/*.d.ts',
      'apps/fronted/src/auto-imports.d.ts',
      'apps/fronted/src/components.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            'apps/backend/tsconfig.json',
            'apps/fronted/tsconfig.app.json',
            'apps/app/tsconfig.json',
          ],
        },
      },
    },
    rules: {
      'import/order': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'vue/attributes-order': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        ...globals.es2022,
        ...globals.node,
      },
    },
  },
  {
    files: ['apps/fronted/src/**/*.{ts,vue}', 'apps/app/src/**/*.{ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        uni: 'readonly',
        UniApp: 'readonly',
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'commonjs',
    },
  },
];
