import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { Env } from '../config/env.validation.js';
import { UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtPayload } from './types/jwt-payload.type.js';

const INVALID_REFRESH_TOKEN_MESSAGE = 'Invalid or expired refresh token';
const DAY_MS = 24 * 60 * 60 * 1000;
// Two tabs refreshing at the same moment is normal, not theft. Only older reuse counts as theft.
const REUSE_GRACE_MS = 10 * 1000;

// We store only this hash. If the database leaks, the stored values can't be used as tokens.
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  // Called at login and at every refresh: a new access token + a new refresh token
  async issueTokens(user: { id: number; role: UserRole }) {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    // 32 random bytes: impossible to guess, so a fast hash (sha256) is enough to store it
    const refreshToken = randomBytes(32).toString('base64url');
    const ttlDays = this.config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true });
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + ttlDays * DAY_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  // Swap a refresh token for a new pair. Each refresh token works exactly once ("rotation").
  async rotate(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: true },
    });
    if (!stored) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    // Already used. If it was used more than a few seconds ago, someone is replaying
    // an old token, so it was probably stolen: end every session of this user.
    if (stored.revokedAt) {
      if (Date.now() - stored.revokedAt.getTime() > REUSE_GRACE_MS) {
        await this.revokeAllForUser(stored.userId);
      }
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    if (stored.expiresAt <= new Date()) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    // Mark it used. "revokedAt: null" in the filter means only ONE of two parallel requests can win.
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count === 0) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    return this.issueTokens(stored.user);
  }

  // Logout: this session only. Safe to call with an unknown or already-revoked token.
  async revoke(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: number) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
