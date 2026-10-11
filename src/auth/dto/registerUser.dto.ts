import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// With stopAtFirstError, class-validator runs decorators bottom → top,
// so the most basic check (required) sits closest to the property.
export class RegisterUserDto {
  @ApiProperty({ example: 'Tabib' })
  @Transform(trim)
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({ example: 'E Alahi' })
  @Transform(trim)
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({ example: 'example@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254, { message: 'Email must not exceed 254 characters' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'P@ssWord123' })
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\s]).+$/, {
    message: 'Password must contain at least one uppercase letter, one number, and one special character',
  })
  @IsByteLength(1, 72, { message: 'Password is too long. Please use a shorter password.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
