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

export class CreateFormSchemaDto {
  @ApiProperty({ description: 'title field' })
    @IsString()
    title: string;
  @ApiProperty({ description: 'modelName field' })
    @IsString()
    modelName: string;
  @ApiProperty({ description: 'schema field' })
    @IsObject()
    schema: any;

}

