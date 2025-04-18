import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { Response, Request, Express } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Roles } from '../admin/roles/roles.decorator';
import { Role } from '../admin/roles/role.enum';
import { RolesGuard } from '../admin/roles/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateJwtUserDto } from '../auth/dto/create-jwt-user.dto';
import { FolderService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
interface AuthenticatedRequest extends Request {
  user: CreateJwtUserDto;
}
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Folder')
@Controller('api/folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  /*@Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new Folder' })
  create(@Body() dto: CreateFolderDto) {
    return this.folderService.create(dto);
  }*/
  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'My New Folder' },
        parentId: { type: 'string', nullable: true, example: 'folder-67890' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Folder created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createFolder(@Body() body: { name: string; parentId?: string }) {
    return await this.folderService.createFolder(body.name, body.parentId);
  }
  @Get('lists')
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: String,
    description: 'Optional parent folder ID to filter by hierarchy',
  })
  @ApiResponse({
    status: 200,
    description: 'List of folders',
    type: CreateFolderDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async listFolders(@Query('parentId') parentId: string, @Req() req: Request) {
    return this.folderService.listFolders(parentId);
  }
  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  @ApiOperation({ summary: 'Get all Folder records' })
  findAll(@Req() req: AuthenticatedRequest) {
    console.log(req.user, 'req.user');
    const user = req.user; // Adjust the type if you have a custom one
    const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SUPERADMIN;
    console.log(isAdmin, 'req.user isAdmin');
    if (isAdmin) {
      return this.folderService.findAll(); // fetch all files
    }

    return this.folderService.findAll({ createdById: user.sub }); // fetch user-specific files
  }
  @Get('path/:path')
  @ApiParam({
    name: 'path',
    description: 'Path of the folder to retrieve',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Folder retrieved successfully',
    type: CreateFolderDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getFolderByPath(@Param('path') path: string, @Req() req: Request) {
    return this.folderService.getFolderByPath(path);
  }
  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one Folder by ID' })
  findOne(@Param('id') id: string) {
    return this.folderService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update Folder by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateFolderDto) {
    return this.folderService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete Folder by ID' })
  remove(@Param('id') id: string) {
    return this.folderService.remove(id);
  }
}
