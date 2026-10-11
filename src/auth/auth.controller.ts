import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterUserDto } from './dto/registerUser.dto.js';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { LoginUserDto } from './dto/loginUser.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ResponseMessage('User registered successfully')
    @ApiCreatedResponse({ description: 'User registered successfully' })
    @ApiBadRequestResponse({ description: 'Validation failed' })
    @ApiConflictResponse({ description: 'Email is already registered. Try different email address.' })
    register(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto)

    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Login successful')
    @ApiOkResponse({ description: 'Login successful' })
    @ApiBadRequestResponse({ description: 'Validation failed' })
    @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
    login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto)
    }
}
