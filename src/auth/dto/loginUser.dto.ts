import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsByteLength, IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

// No password-strength rules here: login only checks "does it match?"
// With stopAtFirstError, class-validator runs decorators bottom → top.
export class LoginUserDto {

    @ApiProperty({ example: "example@example.com" })
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    @IsEmail({}, { message: "Please provide a valid email address" })
    @MaxLength(254, { message: "Email must not exceed 254 characters" })
    @IsString({ message: "Email must be a string" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;


    @ApiProperty({ example: "P@ssWord123" })
    @IsByteLength(1, 72, { message: "Password is too long. Please use a shorter password." })
    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password is required" })
    password: string
}