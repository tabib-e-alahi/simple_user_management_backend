import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserModule } from '../user/user.module.js';
import {JwtModule} from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config';
import { Env } from '../config/env.validation.js';


@Module({
  imports: [UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRES_IN', { infer: true }),
          algorithm: 'HS256'
        },
        verifyOptions: {algorithms: ['HS256']}
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
