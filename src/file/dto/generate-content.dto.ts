import { ApiProperty } from '@nestjs/swagger';

export class GenerateContentDto {
  @ApiProperty({
    example: 'Create a login form using React',
    description: 'Content prompt to generate output from',
  })
  content: string;

  @ApiProperty({
    example: 'html',
    description: 'Type of content to generate (e.g., html, json, markdown)',
  })
  type: string;
}
