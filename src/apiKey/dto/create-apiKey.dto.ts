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

export class CreateApiKeyDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'userId field' })
  @IsString()
  userId: string;
  @ApiProperty({ description: 'apiKey field' })
  @IsString()
  apiKey: string;
  @ApiProperty({ description: 'expire field' })
  @IsOptional()
  @IsString()
  expire: string;
  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;
}
