import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { UserService } from '../user/user.service.js';
import { AuthService } from './auth.service.js';

const PASSWORD = 'P@ssWord123';
const TEST_SECRET = 'test-secret-that-is-at-least-32-characters';

describe('AuthService', () => {
  let authService: AuthService;
  const jwtService = new JwtService({ secret: TEST_SECRET, signOptions: { expiresIn: 900 } });

  // A fake UserService: we control what the "database" returns in each test
  const userService = {
    findByEmail: vi.fn(),
    findByEmailWithPassword: vi.fn(),
    createUser: vi.fn(),
  };

  let storedUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  };

  beforeAll(async () => {
    storedUser = {
      id: 1,
      firstName: 'Tabib',
      lastName: 'E Alahi',
      email: 'tabib@example.com',
      password: await bcrypt.hash(PASSWORD, 10),
      role: 'USER',
    };
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.restoreAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('returns the user without the password when the password is correct', async () => {
      userService.findByEmailWithPassword.mockResolvedValue({ ...storedUser });

      const result = await authService.login({ email: storedUser.email, password: PASSWORD });

      expect(result.user).toMatchObject({ id: 1, email: storedUser.email });
      expect(result.user).not.toHaveProperty('password');
    });

    it('returns an access token with only the user id and role inside', async () => {
      userService.findByEmailWithPassword.mockResolvedValue({ ...storedUser });

      const { accessToken } = await authService.login({ email: storedUser.email, password: PASSWORD });
      const payload = await jwtService.verifyAsync(accessToken);

      expect(payload).toMatchObject({ sub: storedUser.id, role: storedUser.role });
      expect(payload).not.toHaveProperty('password');
      expect(payload).not.toHaveProperty('email');
      expect(payload.exp - payload.iat).toBe(900);
    });

    it('throws 401 when the password is wrong', async () => {
      userService.findByEmailWithPassword.mockResolvedValue({ ...storedUser });

      await expect(
        authService.login({ email: storedUser.email, password: 'WrongPass1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws 401 when the email does not exist', async () => {
      userService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: PASSWORD }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('uses the exact same message for wrong email and wrong password', async () => {
      userService.findByEmailWithPassword.mockResolvedValueOnce({ ...storedUser });
      const wrongPassword = await authService
        .login({ email: storedUser.email, password: 'WrongPass1!' })
        .catch((error: Error) => error.message);

      userService.findByEmailWithPassword.mockResolvedValueOnce(null);
      const wrongEmail = await authService
        .login({ email: 'nobody@example.com', password: PASSWORD })
        .catch((error: Error) => error.message);

      expect(wrongEmail).toBe(wrongPassword);
    });

    it('still runs bcrypt when the email does not exist (same timing)', async () => {
      userService.findByEmailWithPassword.mockResolvedValue(null);
      const compareSpy = vi.spyOn(bcrypt, 'compare');

      await authService.login({ email: 'nobody@example.com', password: PASSWORD }).catch(() => {});

      expect(compareSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    const newUser = {
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      password: PASSWORD,
    };

    it('throws 409 and does not hash when the email already exists', async () => {
      userService.findByEmail.mockResolvedValue({ id: 1 });
      const hashSpy = vi.spyOn(bcrypt, 'hash');

      await expect(authService.register(newUser)).rejects.toThrow(ConflictException);
      expect(hashSpy).not.toHaveBeenCalled();
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('saves a hashed password, never the plain one', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.createUser.mockImplementation(async (data) => ({ id: 2, ...data }));

      await authService.register(newUser);

      const savedData = userService.createUser.mock.calls[0][0];
      expect(savedData.password).not.toBe(PASSWORD);
      expect(await bcrypt.compare(PASSWORD, savedData.password)).toBe(true);
    });

    it('passes only the allowed fields to createUser', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.createUser.mockResolvedValue({ id: 2 });

      // Simulate an extra field sneaking in (e.g. if validation was ever turned off)
      await authService.register({ ...newUser, role: 'SUPER_ADMIN' } as typeof newUser);

      const savedData = userService.createUser.mock.calls[0][0];
      expect(Object.keys(savedData).sort()).toEqual(['email', 'firstName', 'lastName', 'password']);
    });
  });
});
