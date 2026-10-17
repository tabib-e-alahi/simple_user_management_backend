import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterUserDto } from './dto/registerUser.dto.js';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { LoginUserDto } from './dto/loginUser.dto.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { AuthUser } from './types/auth-user.type.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

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
    @ApiOkResponse({ description: 'Login successful' })
    @ApiBadRequestResponse({ description: 'Validation failed' })
    @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
    login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto)
    }

    @Get('me')
    @ApiBearerAuth()
    @ResponseMessage('Profile fetched successfully')
    @ApiOkResponse({ description: 'The logged-in user profile' })
    @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
    getMe(@CurrentUser() user: AuthUser) {
        return user
    }
}
