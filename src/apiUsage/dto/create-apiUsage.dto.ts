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

export class CreateApiUsageDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'messageId field' })
  @IsString()
  messageId: string;
  @ApiProperty({ description: 'inputTokens field' })
  @IsOptional()
  @IsInt()
  inputTokens: number;
  @ApiProperty({ description: 'outputTokens field' })
  @IsOptional()
  @IsInt()
  outputTokens: number;
  @ApiProperty({ description: 'cost field' })
  @IsOptional()
  @IsNumber()
  cost: number;
  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;
  @ApiProperty({ description: 'updatedAt field' })
  @IsDate()
  updatedAt: Date;
}
