// src/github/dto/github-tree-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GithubTreeItemDto {
  @ApiProperty({ example: 'src/app.module.ts' })
  path: string;

  @ApiProperty({ example: '100644' })
  mode: string;

  @ApiProperty({ example: 'blob', enum: ['blob', 'tree', 'commit'] })
  type: 'blob' | 'tree' | 'commit';

  @ApiProperty({ example: 'abc123sha' })
  sha: string;

  @ApiProperty({ example: 123, required: false })
  size?: number;

  @ApiProperty({
    example: 'https://api.github.com/repos/owner/repo/git/blobs/abc123',
  })
  url: string;
}
