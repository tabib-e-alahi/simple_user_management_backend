import { ApiProperty } from "@nestjs/swagger";
import { IsByteLength, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer';


export class RegisterUserDto {


    @ApiProperty({
        example: 'Tabib',
    })
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim()
            : value,
    )
    @IsString()
    @IsNotEmpty({ message: 'The First Name field is required and cannot be empty.' })
    @MinLength(1, {
        message: 'First name must be atleast 1 character',
    })
    @MaxLength(50, {
        message: 'First name must not exceed 50 characters',
    })
    firstName: string;


    @ApiProperty({
        example: 'E Alahi',
    })
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim()
            : value,
    )
    @IsString()
    @IsNotEmpty({ message: 'The Last Name field is required and cannot be empty.' })
    @MinLength(1, {
        message: 'Last name must be atleast 1 character',
    })
    @MaxLength(50, {
        message: 'Last name must not exceed 50 characters',
    })
    lastName: string;




    @ApiProperty({
        example: 'example@example.com',
    })
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim().toLowerCase()
            : value,
    )
    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    @MaxLength(254, {
        message: 'Email must not exceed 254 characters',
    })
    @IsEmail(
        {},
        { message: 'Please provide a valid email address' },
    )
    email: string;



    @ApiProperty({
        example: 'P@ssWord123',
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, {
        message: 'Password must be at least 8 characters long',
    })
    @IsByteLength(1, 72, {
        message:
            'Password is too long. Please use a shorter password.',
    })
    @Matches(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\s]).+$/,
        {
            message:
                'Password must contain at least one uppercase letter, one number, and one special character',
        },
    )
    password: string;

}