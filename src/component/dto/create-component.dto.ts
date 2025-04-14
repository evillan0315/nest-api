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

export class CreateComponentDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'name field' })
  @IsString()
  name: string;
  @ApiProperty({ description: 'description field' })
  @IsOptional()
  @IsString()
  description: string;
  @ApiProperty({ description: 'props field' })
  @IsOptional()
  @IsObject()
  props: any;
  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;
  @ApiProperty({ description: 'updatedAt field' })
  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
