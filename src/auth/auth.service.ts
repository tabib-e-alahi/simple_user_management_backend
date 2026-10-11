import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { RegisterUserDto } from './dto/registerUser.dto.js';
import bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/loginUser.dto.js';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.type.js';

const BCRYPT_SALT_ROUNDS = 10;
const INVALID_CREDENTIALS_MESSAGE = "Invalid credintials."

@Injectable()
export class AuthService {
    //A fake hash, made once at startup with the same salt rounds as real ones
    //Used when the email does not exists, so that path taks as long as a real check, for confusing hackers about time
    private readonly dummyPasswordHash = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_SALT_ROUNDS);

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async register(registerUserDto: RegisterUserDto) {

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

        // 2. The hashed the password
        const passwordHashed = await bcrypt.hash(registerUserDto.password, BCRYPT_SALT_ROUNDS);

        // 3. call the fucntion that store user to the db
        return this.userService.createUser({
            firstName: registerUserDto.firstName,
            lastName: registerUserDto.lastName,
            email: registerUserDto.email,
            password: passwordHashed
        })
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.userService.findByEmailWithPassword(loginUserDto.email)

        // Always run bcrypt, even if the user doesn't exist, so both failures take the same time
        const passwordHash = user?.password ?? this.dummyPasswordHash

        //check the password
        const isPasswordValid = await bcrypt.compare(loginUserDto.password, passwordHash)


        // One message for both "no such email" and "wrong password"
        if (!user || !isPasswordValid) {
            throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE)
        }

        //Take the hash out before anyting leaves this method
        const { password: _password, ...safeUser } = user;
        const payload: JwtPayload = { sub: user.id, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload);
        return { user: safeUser, accessToken };
    }
}
