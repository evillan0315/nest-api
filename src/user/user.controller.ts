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

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('User')
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new User' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all User records' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one User by ID' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update User by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete User by ID' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
