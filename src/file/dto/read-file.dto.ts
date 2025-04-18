import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReadFileDto {
  @ApiPropertyOptional({ description: 'Path to a file on the system' })
  filePath?: string;

  @ApiPropertyOptional({ description: 'URL of a file to fetch' })
  url?: string;

  @ApiPropertyOptional({
    description: 'Return a base64 URL Blob instead of plain text',
  })
  generateBlobUrl?: boolean;
}
