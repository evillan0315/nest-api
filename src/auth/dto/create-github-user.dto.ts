import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGithubUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 'user' })
  @IsString()
  role: string;

  @ApiProperty({ default: 'github' })
  @IsString()
  provider: string;

  @ApiProperty()
  @IsString()
  providerAccountId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  access_token?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  refresh_token?: string;
}
