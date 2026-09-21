import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ApiTags } from '@nestjs/swagger';
import { UserModule } from '../user/user.module.js';

@ApiTags('Auth')
@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
