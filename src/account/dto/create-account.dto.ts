import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsBoolean,
  IsNumber,
  IsInt,
  IsDate,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'userId field' })
  @IsString()
  userId!: string;
  @ApiProperty({ description: 'type field' })
  @IsString()
  type: string;
  @ApiProperty({ description: 'provider field' })
  @IsString()
  provider: string;
  @ApiProperty({ description: 'providerAccountId field' })
  @IsString()
  providerAccountId: string;
  @ApiProperty({ description: 'refresh_token field' })
  @IsOptional()
  @IsString()
  refresh_token: string;
  @ApiProperty({ description: 'access_token field' })
  @IsOptional()
  @IsString()
  access_token: string;
  @ApiProperty({ description: 'expires_at field' })
  @IsOptional()
  @IsInt()
  expires_at: number;
  @ApiProperty({ description: 'token_type field' })
  @IsOptional()
  @IsString()
  token_type: string;
  @ApiProperty({ description: 'scope field' })
  @IsOptional()
  @IsString()
  scope: string;
  @ApiProperty({ description: 'id_token field' })
  @IsOptional()
  @IsString()
  id_token: string;
  @ApiProperty({ description: 'session_state field' })
  @IsOptional()
  @IsString()
  session_state: string;
}
