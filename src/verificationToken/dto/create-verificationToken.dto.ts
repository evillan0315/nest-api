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

export class CreateVerificationTokenDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'identifier field' })
  @IsString()
  identifier: string;
  @ApiProperty({ description: 'token field' })
  @IsString()
  token: string;
  @ApiProperty({ description: 'expires field' })
  @IsDate()
  expires: Date;
}
