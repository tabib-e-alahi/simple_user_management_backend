import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterUserDto } from './dto/registerUser.dto.js';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { LoginUserDto } from './dto/loginUser.dto.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { AuthUser } from './types/auth-user.type.js';
import { Env } from '../config/env.validation.js';
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from './refresh-cookie.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly config: ConfigService<Env, true>,
    ) { }

    @Public()
    @Post('register')
    @ResponseMessage('User registered successfully')
    @ApiCreatedResponse({ description: 'User registered successfully' })
    @ApiBadRequestResponse({ description: 'Validation failed' })
    @ApiConflictResponse({ description: 'Email is already registered. Try different email address.' })
    register(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto)
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Login successful')
    @ApiOkResponse({ description: 'Login successful. The refresh token is set as an httpOnly cookie.' })
    @ApiBadRequestResponse({ description: 'Validation failed' })
    @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
    async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
        const { user, accessToken, refreshToken } = await this.authService.login(loginUserDto)
        this.setRefreshCookie(res, refreshToken)
        // The refresh token goes ONLY in the cookie, never in the body
        return { user, accessToken }
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Token refreshed')
    @ApiOkResponse({ description: 'New access token. The refresh token cookie is replaced.' })
    @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        // On failure we do NOT clear the cookie: with two tabs, the losing tab's answer would
        // wipe the new cookie the winning tab just received. A dead cookie is harmless.
        const { accessToken, refreshToken } = await this.authService.refresh(req.cookies?.[REFRESH_COOKIE_NAME])
        this.setRefreshCookie(res, refreshToken)
        return { accessToken }
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Logged out successfully')
    @ApiOkResponse({ description: 'Session ended and cookie removed' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(req.cookies?.[REFRESH_COOKIE_NAME])
        this.clearRefreshCookie(res)
        return null
    }

    @Get('me')
    @ApiBearerAuth()
    @ResponseMessage('Profile fetched successfully')
    @ApiOkResponse({ description: 'The logged-in user profile' })
    @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
    getMe(@CurrentUser() user: AuthUser) {
        return user
    }

    private setRefreshCookie(res: Response, refreshToken: string) {
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, this.cookieOptions())
    }

    private clearRefreshCookie(res: Response) {
        // Must use the same path (and flags) as when it was set, or the browser keeps it
        const { maxAge: _maxAge, ...options } = this.cookieOptions()
        res.clearCookie(REFRESH_COOKIE_NAME, options)
    }

    private cookieOptions() {
        return refreshCookieOptions(
            this.config.get('NODE_ENV', { infer: true }) === 'production',
            this.config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true }),
        )
    }
}
