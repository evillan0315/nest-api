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

export class CreateSessionDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'sessionToken field' })
  @IsString()
  sessionToken: string;
  @ApiProperty({ description: 'userId field' })
  @IsString()
  userId: string;
  @ApiProperty({ description: 'expires field' })
  @IsDate()
  expires: Date;
}
