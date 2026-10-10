import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterUserDto } from './dto/registerUser.dto.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() registerUserDto: RegisterUserDto) {
        const result = this.authService.register(registerUserDto)
        return result
    }

    @Get()
    findOne() {
        return "hellow auth"
    }
}
