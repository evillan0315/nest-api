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

import { ApiUsageService } from './api-usage.service';
import { CreateApiUsageDto } from './dto/create-api-usage.dto';
import { UpdateApiUsageDto } from './dto/update-api-usage.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('ApiUsage')
@Controller('api/api-usage')
export class ApiUsageController {
  constructor(private readonly apiUsageService: ApiUsageService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new ApiUsage' })
  @ApiCreatedResponse({
    description: 'Successfully created ApiUsage.',
    type: CreateApiUsageDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  create(@Body() dto: CreateApiUsageDto) {
    return this.apiUsageService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all ApiUsage records' })
  @ApiOkResponse({
    description: 'Array of ApiUsage records.',
    type: [CreateApiUsageDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findAll() {
    return this.apiUsageService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one ApiUsage by ID' })
  @ApiOkResponse({
    description: 'The requested ApiUsage record.',
    type: CreateApiUsageDto,
  })
  @ApiNotFoundResponse({ description: 'ApiUsage not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findOne(@Param('id') id: string) {
    return this.apiUsageService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update ApiUsage by ID' })
  @ApiOkResponse({
    description: 'Successfully updated ApiUsage.',
    type: UpdateApiUsageDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid update payload.' })
  @ApiNotFoundResponse({ description: 'ApiUsage not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  update(@Param('id') id: string, @Body() dto: UpdateApiUsageDto) {
    return this.apiUsageService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete ApiUsage by ID' })
  @ApiOkResponse({
    description: 'Successfully deleted ApiUsage.',
    type: String,
  })
  @ApiNotFoundResponse({ description: 'ApiUsage not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  remove(@Param('id') id: string) {
    return this.apiUsageService.remove(id);
  }
}
