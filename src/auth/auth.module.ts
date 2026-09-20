import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Module({
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
