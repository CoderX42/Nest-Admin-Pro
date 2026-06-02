import { envValidate } from './env.validation';

describe('envValidate', () => {
  it('fails when DATABASE_URL is missing', () => {
    expect(() => envValidate({ JWT_SECRET: 'change-me-please' })).toThrow(/DATABASE_URL/);
  });

  it('fails in production when JWT_SECRET uses the default value', () => {
    expect(() =>
      envValidate({
        APP_ENV: 'production',
        DATABASE_URL: 'mysql://root:password@localhost:3306/nest_admin_pro',
        JWT_SECRET: 'change-me-please',
      }),
    ).toThrow('JWT_SECRET must be changed in production');
  });
});
