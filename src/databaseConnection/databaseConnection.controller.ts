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

import { DatabaseConnectionService } from './databaseConnection.service';
import { CreateDatabaseConnectionDto } from './dto/create-databaseConnection.dto';
import { UpdateDatabaseConnectionDto } from './dto/update-databaseConnection.dto';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('DatabaseConnection')
@Controller('api/databaseConnection')
export class DatabaseConnectionController {
  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new DatabaseConnection' })
  create(@Body() dto: CreateDatabaseConnectionDto) {
    return this.databaseConnectionService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all DatabaseConnection records' })
  findAll() {
    return this.databaseConnectionService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one DatabaseConnection by ID' })
  findOne(@Param('id') id: string) {
    return this.databaseConnectionService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update DatabaseConnection by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateDatabaseConnectionDto) {
    return this.databaseConnectionService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete DatabaseConnection by ID' })
  remove(@Param('id') id: string) {
    return this.databaseConnectionService.remove(id);
  }
}
