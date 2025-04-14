import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';

import { CreateCognitoDto } from './dto/create-cognito.dto';
import { UpdateCognitoDto } from './dto/update-cognito.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CognitoService } from './cognito.service';
import { Roles } from '../../admin/roles/roles.decorator'; // Ensure correct path
import { Role } from '../../admin/roles/role.enum'; // Ensure correct path
import { RolesGuard } from '../../admin/roles/roles.guard'; // Ensure correct path
import { CognitoGuard } from './cognito.guard'; // Adjust the path as needed

@ApiTags('AWS - Cognito') // Updated Swagger grouping
@ApiBearerAuth() // Requires authentication via Bearer token
@UseGuards(CognitoGuard, RolesGuard)
@Controller('api/cognito') // Nested inside admin
export class CognitoController {
  constructor(private readonly cognitoService: CognitoService) {} // Inject CognitoService
  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new Cognito user' })
  create(@Body() dto: CreateCognitoDto) {
    return this.cognitoService.createUser(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all cognito user records' })
  findAll() {
    return this.cognitoService.listUsers();
  }

  @Get(':username')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one Cognito by username' })
  findOne(@Param('username') username: string) {
    return this.cognitoService.getUserInfo(username);
  }

  @Put(':username')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update cognito user by username' })
  update(@Param('username') username: string, @Body() dto: UpdateCognitoDto) {
    return this.cognitoService.updateUser(username, dto);
  }

  @Delete(':username')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete cognito by username' })
  remove(@Param('username') username: string) {
    return this.cognitoService.deleteUser(username);
  }
}
