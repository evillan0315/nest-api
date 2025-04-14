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

import { ApiKeyService } from './apiKey.service';
import { CreateApiKeyDto } from './dto/create-apiKey.dto';
import { UpdateApiKeyDto } from './dto/update-apiKey.dto';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('ApiKey')
@Controller('api/apiKey')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new ApiKey' })
  create(@Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all ApiKey records' })
  findAll() {
    return this.apiKeyService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one ApiKey by ID' })
  findOne(@Param('id') id: string) {
    return this.apiKeyService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update ApiKey by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateApiKeyDto) {
    return this.apiKeyService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete ApiKey by ID' })
  remove(@Param('id') id: string) {
    return this.apiKeyService.remove(id);
  }
}
