// src/github/github.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GithubService } from './github.service';
import { GithubTreeQueryDto } from './dto/github-tree-query.dto';
import { GithubTreeItemDto } from './dto/github-tree-item.dto';

@ApiTags('Github')
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('tree')
  @ApiOperation({ summary: 'Get a file tree from a GitHub repo' })
  @ApiOkResponse({
    description: 'List of files and folders from the repository',
    type: [GithubTreeItemDto],
  })
  async getFileTree(@Query() query: GithubTreeQueryDto) {
    const { owner, repo, branch = 'main' } = query;
    return this.githubService.getRepoFileTree(owner, repo, branch);
  }
}
