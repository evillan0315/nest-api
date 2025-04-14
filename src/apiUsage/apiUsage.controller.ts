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

import { ApiUsageService } from './apiUsage.service';
import { CreateApiUsageDto } from './dto/create-apiUsage.dto';
import { UpdateApiUsageDto } from './dto/update-apiUsage.dto';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('ApiUsage')
@Controller('api/apiUsage')
export class ApiUsageController {
  constructor(private readonly apiUsageService: ApiUsageService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new ApiUsage' })
  create(@Body() dto: CreateApiUsageDto) {
    return this.apiUsageService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all ApiUsage records' })
  findAll() {
    return this.apiUsageService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one ApiUsage by ID' })
  findOne(@Param('id') id: string) {
    return this.apiUsageService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update ApiUsage by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateApiUsageDto) {
    return this.apiUsageService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete ApiUsage by ID' })
  remove(@Param('id') id: string) {
    return this.apiUsageService.remove(id);
  }
}
