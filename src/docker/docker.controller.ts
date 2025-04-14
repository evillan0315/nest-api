import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DockerService } from './docker.service';
import { CreateContainerDto } from './dto/create-container.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../admin/roles/roles.decorator';
import { Role } from '../admin/roles/role.enum';
import { RolesGuard } from '../admin/roles/roles.guard';
import { CognitoGuard } from '../aws/cognito/cognito.guard';

@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('Docker')
@Controller('api/docker')
export class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Post('create')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new Docker container' })
  @ApiResponse({ status: 201, description: 'Container created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createContainer(@Body() dto: CreateContainerDto) {
    return this.dockerService.createContainer(dto);
  }

  @Put('start/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Start a Docker container' })
  @ApiParam({ name: 'id', description: 'ID of the container to start' })
  @ApiResponse({ status: 200, description: 'Container started successfully' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  async startContainer(@Param('id') id: string) {
    return this.dockerService.startContainer(id);
  }

  @Put('stop/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Stop a Docker container' })
  @ApiParam({ name: 'id', description: 'ID of the container to stop' })
  @ApiResponse({ status: 200, description: 'Container stopped successfully' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  async stopContainer(@Param('id') id: string) {
    return this.dockerService.stopContainer(id);
  }

  @Put('restart/:id')
  @ApiOperation({ summary: 'Restart a Docker container' })
  @ApiParam({ name: 'id', description: 'ID of the container to restart' })
  @ApiResponse({ status: 200, description: 'Container restarted successfully' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  async restartContainer(@Param('id') id: string) {
    return this.dockerService.restartContainer(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Remove a Docker container' })
  @ApiParam({ name: 'id', description: 'ID of the container to remove' })
  @ApiResponse({ status: 200, description: 'Container removed successfully' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  async removeContainer(@Param('id') id: string) {
    return this.dockerService.removeContainer(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'List Docker containers' })
  @ApiQuery({
    name: 'all',
    required: false,
    description: 'Include stopped containers (default: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of containers retrieved successfully',
  })
  async listContainers(@Query('all') all: string) {
    return this.dockerService.listContainers(all !== 'false');
  }
}
