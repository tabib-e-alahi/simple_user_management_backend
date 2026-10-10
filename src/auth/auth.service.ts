import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { RegisterUserDto } from './dto/registerUser.dto.js';
import bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) { }

    async register(registerUserDto: RegisterUserDto) {

        // Logics for registration

        /** 
         * 1. Check user already exists or not (by email)
         * 2. Hash the password
         * 3. store the user into the db
         * 4. generate jwt tokens
         * 5. send token in response
         */

        const hash = await bcrypt.hash(registerUserDto.password, 10);

        const user = this.userService.createUser({ ...registerUserDto, password: hash })

        return user;
    }
}
