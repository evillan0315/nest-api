import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCognitoDto {
  @ApiProperty({
    description: "The user's username in Cognito",
    example: 'john_doe',
  })
  @IsString()
  username: string; // User's username in Cognito

  @ApiProperty({
    description: "The user's email address",
    example: 'john_doe@example.com',
  })
  @IsEmail()
  email: string; // User's email address

  @ApiProperty({ description: "The user's name", example: 'John Doe' })
  @IsString()
  name: string; // User's name

  @ApiProperty({
    description: "The user's email  verification",
    example: 'true',
  })
  @IsOptional()
  email_verified?: boolean;

  @ApiProperty({
    description: "The user's role (optional, default to 'user')",
    example: 'user',
    required: false,
  })
  @IsString()
  @IsOptional()
  role: string; // User's role (optional, default to 'user')

  @ApiProperty({
    description: 'List of groups the user belongs to (optional)',
    example: ['admin', 'developer'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  groups?: string[]; // List of groups the user belongs to (optional)
  @ApiProperty({
    description: "The user's profile image URL (optional)",
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;
}
