// src/utils/dto/upload-env.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadEnvDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Upload your .env file',
  })
  @IsNotEmpty()
  @Type(() => Buffer)
  file: any;
}
