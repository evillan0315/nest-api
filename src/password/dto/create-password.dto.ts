import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePasswordDto {
  @ApiProperty({ description: 'Unique identifier for the password record' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Hashed password string' })
  @IsString()
  hash: string;

  @ApiProperty({ description: 'Related user ID' })
  @IsString()
  userId: string;
}
