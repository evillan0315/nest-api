import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { Roles } from '../admin/roles/roles.decorator';
import { Role } from '../admin/roles/role.enum';
import { RolesGuard } from '../admin/roles/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

import { SnippetService } from './snippet.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Snippet')
@Controller('api/snippet')
export class SnippetController {
  constructor(private readonly snippetService: SnippetService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new Snippet' })
  @ApiCreatedResponse({
    description: 'Successfully created Snippet.',
    type: CreateSnippetDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  create(@Body() dto: CreateSnippetDto) {
    return this.snippetService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all Snippet records' })
  @ApiOkResponse({
    description: 'Array of Snippet records.',
    type: [CreateSnippetDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findAll() {
    return this.snippetService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one Snippet by ID' })
  @ApiOkResponse({
    description: 'The requested Snippet record.',
    type: CreateSnippetDto,
  })
  @ApiNotFoundResponse({ description: 'Snippet not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findOne(@Param('id') id: string) {
    return this.snippetService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update Snippet by ID' })
  @ApiOkResponse({
    description: 'Successfully updated Snippet.',
    type: UpdateSnippetDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid update payload.' })
  @ApiNotFoundResponse({ description: 'Snippet not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  update(@Param('id') id: string, @Body() dto: UpdateSnippetDto) {
    return this.snippetService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete Snippet by ID' })
  @ApiOkResponse({
    description: 'Successfully deleted Snippet.',
    type: String,
  })
  @ApiNotFoundResponse({ description: 'Snippet not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  remove(@Param('id') id: string) {
    return this.snippetService.remove(id);
  }
}
