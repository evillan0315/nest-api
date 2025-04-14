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
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
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
  @ApiProperty({ description: 'createdById field' })
  @IsOptional()
  @IsString()
  createdById: string;
  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;
  @ApiProperty({ description: 'updatedAt field' })
  @IsDate()
  updatedAt: Date;
}
