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

import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Organization')
@Controller('api/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new Organization' })
  @ApiCreatedResponse({
    description: 'Successfully created Organization.',
    type: CreateOrganizationDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all Organization records' })
  @ApiOkResponse({
    description: 'Array of Organization records.',
    type: [CreateOrganizationDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one Organization by ID' })
  @ApiOkResponse({
    description: 'The requested Organization record.',
    type: CreateOrganizationDto,
  })
  @ApiNotFoundResponse({ description: 'Organization not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update Organization by ID' })
  @ApiOkResponse({
    description: 'Successfully updated Organization.',
    type: UpdateOrganizationDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid update payload.' })
  @ApiNotFoundResponse({ description: 'Organization not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete Organization by ID' })
  @ApiOkResponse({
    description: 'Successfully deleted Organization.',
    type: String,
  })
  @ApiNotFoundResponse({ description: 'Organization not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }
}
