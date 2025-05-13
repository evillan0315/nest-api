import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from '../admin/roles/roles.decorator';
import { Role } from '../admin/roles/role.enum';
import { RolesGuard } from '../admin/roles/roles.guard';
import { CognitoGuard } from '../aws/cognito/cognito.guard';

import { DocumentationService } from './documentation.service';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';
import { PaginationResultDto } from './dto/pagination-result.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

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
  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated list of documentations' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of documentations',
    type: PaginationResultDto,
  })
  async findAllPaginated(@Query() query: PaginationQueryDto) {
    const { page, pageSize } = query;
    return this.documentationService.findAllPaginated(
      undefined,
      page,
      pageSize,
    );
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
