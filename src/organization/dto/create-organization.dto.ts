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

export class CreateOrganizationDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'name field' })
  @IsString()
  name: string;
  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;
  @ApiProperty({ description: 'updatedAt field' })
  @IsDate()
  updatedAt: Date;
}
