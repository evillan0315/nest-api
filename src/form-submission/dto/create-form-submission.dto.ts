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

export class CreateFormSubmissionDto {
  @ApiProperty({ description: 'formId field' })
    @IsString()
    formId: string;
  @ApiProperty({ description: 'data field' })
    @IsObject()
    data: any;

}

