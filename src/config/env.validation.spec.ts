import { validateEnv } from './env.validation.js';

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  JWT_ACCESS_SECRET: 'a-very-long-secret-that-is-at-least-32-chars',
};

describe('validateEnv', () => {
  it('accepts a valid environment and fills in defaults', () => {
    const env = validateEnv(validEnv);

    expect(env.PORT).toBe(3000);
    expect(env.JWT_ACCESS_EXPIRES_IN).toBe(900);
  });

  it('turns number strings from .env into real numbers', () => {
    const env = validateEnv({ ...validEnv, PORT: '4000', JWT_ACCESS_EXPIRES_IN: '600' });

    expect(env.PORT).toBe(4000);
    expect(env.JWT_ACCESS_EXPIRES_IN).toBe(600);
  });

  it('refuses to start without JWT_ACCESS_SECRET', () => {
    const { JWT_ACCESS_SECRET: _secret, ...env } = validEnv;

    expect(() => validateEnv(env)).toThrow(/JWT_ACCESS_SECRET/);
  });

  it('refuses a JWT_ACCESS_SECRET that is too short', () => {
    expect(() => validateEnv({ ...validEnv, JWT_ACCESS_SECRET: 'secret' })).toThrow(/at least 32/);
  });
});
