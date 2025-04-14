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

import { VerificationTokenService } from './verificationToken.service';
import { CreateVerificationTokenDto } from './dto/create-verificationToken.dto';
import { UpdateVerificationTokenDto } from './dto/update-verificationToken.dto';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('VerificationToken')
@Controller('api/verificationToken')
export class VerificationTokenController {
  constructor(
    private readonly verificationTokenService: VerificationTokenService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new VerificationToken' })
  create(@Body() dto: CreateVerificationTokenDto) {
    return this.verificationTokenService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all VerificationToken records' })
  findAll() {
    return this.verificationTokenService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one VerificationToken by ID' })
  findOne(@Param('id') id: string) {
    return this.verificationTokenService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update VerificationToken by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateVerificationTokenDto) {
    return this.verificationTokenService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete VerificationToken by ID' })
  remove(@Param('id') id: string) {
    return this.verificationTokenService.remove(id);
  }
}
