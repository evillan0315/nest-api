import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../admin/roles/roles.decorator';
import { Role } from '../admin/roles/role.enum';
import { RolesGuard } from '../admin/roles/roles.guard';
import { CognitoGuard } from '../aws/cognito/cognito.guard';

import { SnippetService } from './snippet.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('Snippet')
@Controller('api/snippet')
export class SnippetController {
  constructor(private readonly snippetService: SnippetService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new Snippet' })
  create(@Body() dto: CreateSnippetDto) {
    return this.snippetService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all Snippet records' })
  findAll() {
    return this.snippetService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one Snippet by ID' })
  findOne(@Param('id') id: string) {
    return this.snippetService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update Snippet by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateSnippetDto) {
    return this.snippetService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete Snippet by ID' })
  remove(@Param('id') id: string) {
    return this.snippetService.remove(id);
  }
}
