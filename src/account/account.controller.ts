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

import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('Account')
@Controller('api/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new Account' })
  create(@Body() dto: CreateAccountDto) {
    return this.accountService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all Account records' })
  findAll() {
    return this.accountService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one Account by ID' })
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update Account by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete Account by ID' })
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }
}
