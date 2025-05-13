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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Roles } from '../admin/roles/roles.decorator';
import { Role } from '../admin/roles/role.enum';
import { RolesGuard } from '../admin/roles/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

import { ComponentService } from './component.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Component')
@Controller('component')
export class ComponentController {
  constructor(private readonly componentService: ComponentService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new Component' })
  @ApiCreatedResponse({
    description: 'Successfully created Component.',
    type: CreateComponentDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or validation failed.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access (no valid token).',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  create(@Body() dto: CreateComponentDto) {
    return this.componentService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all Component records' })
  @ApiOkResponse({
    description: 'Array of Component records.',
    type: [CreateComponentDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access (no valid token).',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findAll() {
    return this.componentService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one Component by ID' })
  @ApiOkResponse({
    description: 'The requested Component record.',
    type: CreateComponentDto,
  })
  @ApiNotFoundResponse({ description: 'Component not found.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access (no valid token).',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  findOne(@Param('id') id: string) {
    return this.componentService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update Component by ID' })
  @ApiOkResponse({
    description: 'Successfully updated Component.',
    type: UpdateComponentDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid update payload.' })
  @ApiNotFoundResponse({ description: 'Component not found.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access (no valid token).',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  update(@Param('id') id: string, @Body() dto: UpdateComponentDto) {
    return this.componentService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete Component by ID' })
  @ApiOkResponse({
    description: 'Successfully deleted Component.',
    type: String,
  })
  @ApiNotFoundResponse({ description: 'Component not found.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access (no valid token).',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient permissions.' })
  remove(@Param('id') id: string) {
    return this.componentService.remove(id);
  }
}
