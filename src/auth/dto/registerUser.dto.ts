import { ApiProperty } from "@nestjs/swagger";


type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export class RegisterUserDto {
    @ApiProperty({
        example: 'Tabib',
    })
    fName: string;

    @ApiProperty({
        example: 'E Alahi',
    })
    lName: string;

    @ApiProperty({
        example: 'example@example.com',
    })
    email: string;

    @ApiProperty({
        example: '12345678',
    })
    password: string;

}