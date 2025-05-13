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

import { FormSchemaService } from './form-schema.service';
import { CreateFormSchemaDto } from './dto/create-form-schema.dto';
import { UpdateFormSchemaDto } from './dto/update-form-schema.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('FormSchema')
@Controller('api/form-schema')
export class FormSchemaController {
  constructor(private readonly formSchemaService: FormSchemaService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new FormSchema' })
  @ApiCreatedResponse({
    description: 'Successfully created FormSchema.',
    type: CreateFormSchemaDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  create(@Body() dto: CreateFormSchemaDto) {
    return this.formSchemaService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all FormSchema records' })
  @ApiOkResponse({
    description: 'Array of FormSchema records.',
    type: [CreateFormSchemaDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findAll() {
    return this.formSchemaService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one FormSchema by ID' })
  @ApiOkResponse({
    description: 'The requested FormSchema record.',
    type: CreateFormSchemaDto,
  })
  @ApiNotFoundResponse({ description: 'FormSchema not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findOne(@Param('id') id: string) {
    return this.formSchemaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update FormSchema by ID' })
  @ApiOkResponse({
    description: 'Successfully updated FormSchema.',
    type: UpdateFormSchemaDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid update payload.' })
  @ApiNotFoundResponse({ description: 'FormSchema not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  update(@Param('id') id: string, @Body() dto: UpdateFormSchemaDto) {
    return this.formSchemaService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete FormSchema by ID' })
  @ApiOkResponse({
    description: 'Successfully deleted FormSchema.',
    type: String,
  })
  @ApiNotFoundResponse({ description: 'FormSchema not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (no valid token).' })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  remove(@Param('id') id: string) {
    return this.formSchemaService.remove(id);
  }
}
