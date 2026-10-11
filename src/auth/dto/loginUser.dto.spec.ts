import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginUserDto } from './loginUser.dto.js';

// Runs the DTO the same way the global ValidationPipe does
async function check(body: object) {
  const dto = plainToInstance(LoginUserDto, body);
  const errors = await validate(dto, { stopAtFirstError: true });
  return { dto, messages: errors.flatMap((e) => Object.values(e.constraints ?? {})) };
}

describe('LoginUserDto', () => {
  it('trims and lowercases the email', async () => {
    const { dto, messages } = await check({ email: '  TABIB@Example.com ', password: 'anything' });

    expect(messages).toEqual([]);
    expect(dto.email).toBe('tabib@example.com');
  });

  it('does not trim the password', async () => {
    const { dto } = await check({ email: 'a@b.co', password: ' secret ' });

    expect(dto.password).toBe(' secret ');
  });

  it('requires email and password', async () => {
    const { messages } = await check({});

    expect(messages).toEqual(['Email is required', 'Password is required']);
  });

  it('does not apply password-strength rules', async () => {
    const { messages } = await check({ email: 'a@b.co', password: 'abc' });

    expect(messages).toEqual([]);
  });

  it('rejects a password longer than 72 bytes', async () => {
    const { messages } = await check({ email: 'a@b.co', password: 'অ'.repeat(30) });

    expect(messages).toEqual(['Password is too long. Please use a shorter password.']);
  });

  it('rejects an invalid email', async () => {
    const { messages } = await check({ email: 'not-an-email', password: 'abc' });

    expect(messages).toEqual(['Please provide a valid email address']);
  });
});
