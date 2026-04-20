import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsEnum, 
  IsOptional 
} from 'class-validator';

import { UserRole } from '../enum/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName!: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'User password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  // ✅ ROLE (optional, default user)
  // @ApiProperty({
  //   enum: UserRole,
  //   example: UserRole.USER,
  //   required: false,
  //   description: 'User role (default: user)',
  // })
  // @IsOptional()
  // @IsEnum(UserRole)
  // role?: UserRole;
}