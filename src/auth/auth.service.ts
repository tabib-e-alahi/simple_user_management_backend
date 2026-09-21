import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { RegisterUserDto } from './dto/registerUser.dto.js';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) { }

    register(registerUserDto: RegisterUserDto) {

        // Logics for registration

        /** 
         * 1. Check user already exists or not (by email)
         * 2. Hash the password
         * 3. store the user into the db
         * 4. generate jwt tokens
         * 5. send token in response
         */

        return this.userService.create()
    }
}
