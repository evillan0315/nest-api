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

import { PasswordService } from './password.service';
import { CreatePasswordDto } from './dto/create-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('Password')
@Controller('api/password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new Password' })
  create(@Body() dto: CreatePasswordDto) {
    return this.passwordService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all Password records' })
  findAll() {
    return this.passwordService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one Password by ID' })
  findOne(@Param('id') id: string) {
    return this.passwordService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update Password by ID' })
  update(@Param('id') id: string, @Body() dto: UpdatePasswordDto) {
    return this.passwordService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete Password by ID' })
  remove(@Param('id') id: string) {
    return this.passwordService.remove(id);
  }
}
