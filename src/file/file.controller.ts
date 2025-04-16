import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
  Param,
  Res,
  StreamableFile,
  Header,
  Patch,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { diskStorage } from 'multer';
import { Response, Request, Express } from 'express';
import axios from 'axios';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';

import { Roles } from '../admin/roles/roles.decorator';
import { Role } from '../admin/roles/role.enum';
import { RolesGuard } from '../admin/roles/roles.guard';
import { CognitoGuard } from '../aws/cognito/cognito.guard';

import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ConvertFileDto } from './dto/convert-file.dto';
import { FileFormat } from './file-format.enum';
import { FileFormatDto } from './dto/file-format.dto';
import { FileInputDto } from './dto/file-input.dto';
import { ReadFileDto } from './dto/read-file.dto';
import { ReadFileResponseDto } from './dto/read-file-response.dto';
@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('File')
@Controller('api/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Get('list')
  @ApiOperation({ summary: 'List files in a directory' })
  @ApiQuery({
    name: 'directory',
    required: false,
    description: 'Path to the directory',
  })
  @ApiQuery({
    name: 'recursive',
    required: false,
    type: Boolean,
    description: 'List files recursively',
  })
  @ApiResponse({ status: 200, description: 'List of files and directories' })
  async getFiles(
    @Query('directory') directory?: string,
    @Query('recursive') recursive: boolean = false,
  ) {
    return this.fileService.getFilesByDirectory(directory, recursive);
  }
  @Post('read')
  @ApiOperation({
    summary: 'Read file content from upload, local path, or URL',
  })
  @ApiResponse({ status: 200, type: ReadFileResponseDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Upload a file (optional if using filePath or url)',
        },
        filePath: {
          type: 'string',
          description: 'Path to a file on the local file system',
        },
        url: {
          type: 'string',
          description: 'URL of a remote file to fetch content from',
        },
        generateBlobUrl: {
          type: 'boolean',
          description: 'Return as base64 blob-style data URL',
        },
      },
      required: [],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File content returned successfully.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async readFileContent(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ReadFileDto,
  ): Promise<ReadFileResponseDto> {
    let buffer: Buffer;
    let filename = 'file';

    if (file?.buffer) {
      buffer = file.buffer;
      filename = file.originalname || filename;
    } else if (body.filePath) {
      try {
        buffer = await fs.readFile(body.filePath);
        filename = body.filePath.split('/').pop() || filename;
      } catch {
        throw new BadRequestException(`Unable to read file from path: ${body.filePath}`);
      }
    } else if (body.url) {
      try {
        const res = await axios.get(body.url, { responseType: 'arraybuffer' });
        buffer = Buffer.from(res.data);
        filename = body.url.split('/').pop() || filename;
      } catch {
        throw new BadRequestException(`Unable to fetch file from URL: ${body.url}`);
      }
    } else {
      throw new BadRequestException('Please provide a file, filePath, or url.');
    }

    return this.fileService.readFile(buffer, filename, body.generateBlobUrl);
  }

  @Post('ai-file-convert')
  @ApiOperation({ summary: 'Upload file and convert content using Gemini' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Upload a file (optional if using filePath or url)',
        },
        filePath: {
          type: 'string',
          description: 'Path to a file on the local file system',
        },
        url: {
          type: 'string',
          description: 'URL of a remote file to fetch content from',
        },
        format: {
          type: 'string',
          enum: ['json', 'markdown', 'html', 'text'],
          description: 'Desired conversion format',
        },
      },
      required: ['format'],
    },
  })
  @ApiResponse({ status: 201, description: 'File converted successfully.' })
  @UseInterceptors(FileInterceptor('file'))
  async aiConvertFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ConvertFileDto,
  ): Promise<string> {
    let buffer: Buffer;

    // Priority: File Upload > File Path > URL
    if (file && file.buffer) {
      buffer = file.buffer;
    } else if (body.filePath) {
      try {
        buffer = await fs.readFile(body.filePath);
      } catch (error) {
        throw new BadRequestException(
          `Failed to read file at path: ${body.filePath}`,
        );
      }
    } else if (body.url) {
      try {
        const res = await axios.get(body.url, { responseType: 'arraybuffer' });
        buffer = Buffer.from(res.data);
      } catch (error) {
        throw new BadRequestException(
          `Failed to fetch file from URL: ${body.url}`,
        );
      }
    } else {
      throw new BadRequestException(
        'You must provide a file, filePath, or url.',
      );
    }

    return this.fileService.readFileAndConvert(buffer, body.format);
  }
  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create new File' })
  create(@Body() dto: CreateFileDto) {
    return this.fileService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get all File records' })
  findAll() {
    return this.fileService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get one File by ID' })
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update File by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateFileDto) {
    return this.fileService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delete File by ID' })
  remove(@Param('id') id: string) {
    return this.fileService.remove(id);
  }
}
