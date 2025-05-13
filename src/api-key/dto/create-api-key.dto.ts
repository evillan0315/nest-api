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
  @ApiProperty({ description: 'apiKey field' })
    @IsString()
    apiKey: string;
  @ApiProperty({ description: 'expire field' })
    @IsOptional()
    @IsString()
    expire: string;

}

