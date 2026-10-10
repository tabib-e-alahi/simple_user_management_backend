import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { isPrismaError, PrismaErrorCode } from '../prisma/prisma-errors.js';

export type CreateUserData = Pick<Prisma.UserCreateInput, 'firstName' | 'lastName' | 'email' | 'password'>

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email
            }
        })
    }

    async createUser(userData: CreateUserData) {
        try {
            return await this.prisma.user.create({
                data: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    password: userData.password,
                }
            })
        } catch (error) {
            if (isPrismaError(error, PrismaErrorCode.UniqueConstraintFailed)) {
                throw new ConflictException({
                    message: 'Email is already registered. Try different email address.',
                    errors: [{ field: 'email', message: 'Email is already registered. Try different email address.' }]
                })
            }
            throw error;
        }
    }
}
