import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterUserDto } from './dto/registerUser.dto.js';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';

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

    @Get()
    findOne() {
        return "hellow auth"
    }
}
