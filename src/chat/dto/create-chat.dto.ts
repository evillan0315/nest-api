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

export class CreateChatDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'userId field' })
  @IsString()
  userId: string;
  @ApiProperty({ description: 'title field' })
  @IsOptional()
  @IsString()
  title: string;
  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;
  @ApiProperty({ description: 'updatedAt field' })
  @IsDate()
  updatedAt: Date;
}
