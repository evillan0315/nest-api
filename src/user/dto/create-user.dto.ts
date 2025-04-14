import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePasswordDto } from '../../password/dto/create-password.dto'; // adjust path as needed

export class CreateUserDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'email field' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'emailVerified field', required: false })
  @IsOptional()
  @IsDate()
  emailVerified?: Date;

  @ApiProperty({ description: 'image field', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'name field', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'phone_number field', required: false })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({ description: 'updatedAt field', required: false })
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiProperty({ description: 'role field', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: 'isActive field' })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'password field' })
  @IsOptional()
  password?: any;
}
