import { ApiProperty } from '@nestjs/swagger';
import { FileFormat } from '../file-format.enum';

export class ConvertFileDto {
  @ApiProperty({ enum: FileFormat, enumName: 'FileFormat' })
  format: FileFormat;
}
