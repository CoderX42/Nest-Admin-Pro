const TASK_COMMIT_PATTERN =
  /^\[T-(?:\d{3}|[A-Z]\d{2})\] (feat|fix|chore|refactor|test|docs|build|ci)\((backend|fronted|app|infra|docs|db)\): .+$/;

module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'task-message-format': (parsed) => {
          const message = (parsed.raw || '').split(/\r?\n/, 1)[0] || '';

          return [
            TASK_COMMIT_PATTERN.test(message),
            'commit message must match [T-XXX] <type>(<scope>): <subject>',
          ];
        },
      },
    },
  ],
  rules: {
    'task-message-format': [2, 'always'],
    'type-enum': [0],
    'scope-enum': [0],
    'subject-empty': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
