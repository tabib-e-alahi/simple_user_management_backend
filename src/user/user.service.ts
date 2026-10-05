import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../auth/dto/registerUser.dto.js';

@Injectable()
export class UserService {
    create(registerUserDto: RegisterUserDto){
        return registerUserDto;
    }
}
