import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { UserService } from '../../user/user.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { AuthenticatedRequest } from '../types/auth-user.type.js';
import { JwtPayload } from '../types/jwt-payload.type.js';

const INVALID_TOKEN_MESSAGE = 'Invalid or expired token';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Routes marked @Public() need no token
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 2. Read the token from "Authorization: Bearer <token>"
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    // 3. Check the stamp and the expiry. Any failure gives the same 401.
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    // 4. Make sure the user still exists (a deleted user's token stops working at once)
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    // 5. Attach the fresh user (no password) for @CurrentUser()
    request.user = user;
    return true;
  }

  private extractBearerToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : undefined;
  }
}
