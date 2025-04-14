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

export class CreateFolderDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'name field' })
  @IsString()
  name: string;
  @ApiProperty({ description: 'path field' })
  @IsString()
  path: string;
  @ApiProperty({ description: 'parentId field' })
  @IsOptional()
  @IsString()
  parentId: string;
  @ApiProperty({ description: 'createdById field' })
  @IsString()
  createdById: string;
  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;
}
