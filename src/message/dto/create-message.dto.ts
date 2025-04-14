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

export class CreateMessageDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'chatId field' })
  @IsString()
  chatId: string;
  @ApiProperty({ description: 'content field' })
  @IsString()
  content: string;
  @ApiProperty({ description: 'sender field' })
  @IsString()
  sender: string;
  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;
  @ApiProperty({ description: 'updatedAt field' })
  @IsDate()
  updatedAt: Date;
}
