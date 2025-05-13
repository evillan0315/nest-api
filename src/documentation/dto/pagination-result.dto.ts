import { ApiProperty } from '@nestjs/swagger';
import { DocumentationDto } from './documentation.dto';

export class PaginationResultDto {
  @ApiProperty({ type: [DocumentationDto] })
  items: DocumentationDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}
