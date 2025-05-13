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

import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('ApiKey')
@Controller('api/api-key')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new ApiKey' })
  @ApiCreatedResponse({
    description: 'Successfully created ApiKey.',
    type: CreateApiKeyDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  create(@Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all ApiKey records' })
  @ApiOkResponse({
    description: 'Array of ApiKey records.',
    type: [CreateApiKeyDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findAll() {
    return this.apiKeyService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one ApiKey by ID' })
  @ApiOkResponse({
    description: 'The requested ApiKey record.',
    type: CreateApiKeyDto,
  })
  @ApiNotFoundResponse({ description: 'ApiKey not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findOne(@Param('id') id: string) {
    return this.apiKeyService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update ApiKey by ID' })
  @ApiOkResponse({
    description: 'Successfully updated ApiKey.',
    type: UpdateApiKeyDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid update payload.' })
  @ApiNotFoundResponse({ description: 'ApiKey not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  update(@Param('id') id: string, @Body() dto: UpdateApiKeyDto) {
    return this.apiKeyService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete ApiKey by ID' })
  @ApiOkResponse({
    description: 'Successfully deleted ApiKey.',
    type: String,
  })
  @ApiNotFoundResponse({ description: 'ApiKey not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  remove(@Param('id') id: string) {
    return this.apiKeyService.remove(id);
  }
}
