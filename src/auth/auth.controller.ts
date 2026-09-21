import { Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    @Post('register')
    register(){
        return "hellow from register"
    }

    @Get()
    findOne() {
        return "hellow auth"
    }
}
