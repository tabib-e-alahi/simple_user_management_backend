import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { RegisterUserDto } from './dto/registerUser.dto.js';
import bcrypt from 'bcrypt'

const BCRYPT_SALT_ROUNDS = 10;

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

        // 1. Check user already exists or not (by email)
        // before password hassing always
        const existingUser = await this.userService.findByEmail(registerUserDto.email)

        if (existingUser) {
            throw new ConflictException({
                message: "Email is already registered. Try different email address.",
                errors: [{
                    field: 'email', message: "Email is already registered. Try different email address."
                }]
            })
        }

        const passwordHashed = await bcrypt.hash(registerUserDto.password, BCRYPT_SALT_ROUNDS);

        return this.userService.createUser({ ...registerUserDto, password: passwordHashed })

        
    }
}
