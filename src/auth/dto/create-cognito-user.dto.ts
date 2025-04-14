import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCognitoUserDto {
  @ApiProperty({ example: 'jane.doe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'https://lh3.googleusercontent.com/a-/AOh14Gi...',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'user' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'cognito' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'sub id/ cognitoID' })
  @IsString()
  providerAccountId: string;

  @ApiProperty({ example: 'ya29.a0AfH6SMA...' })
  @IsOptional()
  @IsString()
  access_token?: string;

  @ApiProperty({ example: 'refresh_token_value' })
  @IsOptional()
  @IsString()
  refresh_token?: string;

  @ApiProperty({ example: 1713123456 })
  @IsOptional()
  expires_at?: number;

  @ApiProperty({ example: 'Bearer' })
  @IsOptional()
  @IsString()
  token_type?: string;

  @ApiProperty({ example: 'openid email profile' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiProperty({ example: 'id_token_string' })
  @IsOptional()
  @IsString()
  id_token?: string;

  @ApiProperty({ example: 'session_state_string' })
  @IsOptional()
  @IsString()
  session_state?: string;
}
