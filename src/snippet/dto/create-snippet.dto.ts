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

export class CreateSnippetDto {
  @ApiProperty({ description: 'name field' })
    @IsOptional()
    @IsString()
    name: string;
  @ApiProperty({ description: 'code field' })
    @IsObject()
    code: any;
  @ApiProperty({ description: 'language field' })
    @IsOptional()
    @IsString()
    language: string;

}

