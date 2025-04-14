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

export class CreateDatabaseConnectionDto {
  @ApiProperty({ description: 'id field' })
  @IsString()
  id: string;
  @ApiProperty({ description: 'name field' })
  @IsString()
  name: string;
  @ApiProperty({ description: 'type field' })
  @IsString()
  type: string;
  @ApiProperty({ description: 'host field' })
  @IsOptional()
  @IsString()
  host: string;
  @ApiProperty({ description: 'port field' })
  @IsOptional()
  @IsInt()
  port: number;
  @ApiProperty({ description: 'username field' })
  @IsOptional()
  @IsString()
  username: string;
  @ApiProperty({ description: 'password field' })
  @IsOptional()
  @IsString()
  password: string;
  @ApiProperty({ description: 'databaseName field' })
  @IsOptional()
  @IsString()
  databaseName: string;
  @ApiProperty({ description: 'connectionString field' })
  @IsOptional()
  @IsString()
  connectionString: string;
  @ApiProperty({ description: 'default field' })
  @IsBoolean()
  default: boolean;
  @ApiProperty({ description: 'createdAt field' })
  @IsDate()
  createdAt: Date;
  @ApiProperty({ description: 'updatedAt field' })
  @IsDate()
  updatedAt: Date;
  @ApiProperty({ description: 'createdById field' })
  @IsString()
  createdById: string;
}
