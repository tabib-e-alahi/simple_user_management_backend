import { ApiProperty } from "@nestjs/swagger";

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