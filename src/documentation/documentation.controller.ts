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

import { DocumentationService } from './documentation.service';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('Documentation')
@Controller('api/documentation')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new Documentation' })
  create(@Body() dto: CreateDocumentationDto) {
    return this.documentationService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all Documentation records' })
  findAll() {
    return this.documentationService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one Documentation by ID' })
  findOne(@Param('id') id: string) {
    return this.documentationService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update Documentation by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateDocumentationDto) {
    return this.documentationService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete Documentation by ID' })
  remove(@Param('id') id: string) {
    return this.documentationService.remove(id);
  }
}
