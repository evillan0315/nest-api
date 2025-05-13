import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GithubTreeQueryDto {
  @ApiProperty()
  @IsNotEmpty()
  owner: string;

  @ApiProperty()
  @IsNotEmpty()
  repo: string;

  @ApiPropertyOptional()
  @IsOptional()
  branch?: string;
}
