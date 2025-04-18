import { ApiProperty } from '@nestjs/swagger';

export class ReadFileResponseDto {
  @ApiProperty({ description: 'Original file name (if available)' })
  filename: string;

  @ApiProperty({ description: 'MIME type of the file' })
  mimeType: string;

  @ApiProperty({ description: 'File content or data URL (base64-encoded)' })
  data: string;
}
