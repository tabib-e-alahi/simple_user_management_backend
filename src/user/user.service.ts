import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../auth/dto/registerUser.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(userData: RegisterUserDto) {
        return await this.prisma.user.create({
            data: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
            }
        })
    }
}
