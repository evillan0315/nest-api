import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Readable } from 'stream';
import { Prisma } from '@prisma/client';
import { REQUEST } from '@nestjs/core';
import { Request, Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { CreateJwtUserDto } from '../auth/dto/create-jwt-user.dto';
import { FileFormat } from './file-format.enum';
import { GoogleGeminiService } from '../google-gemini/google-gemini.service';
import { GeminiDto } from '../google-gemini/dto/gemini.dto';
import { lookup as mimeLookup } from 'mime-types';
import { ReadFileResponseDto } from './dto/read-file-response.dto';

@Injectable()
export class FileService {
  constructor(
    @Inject('EXCLUDED_FOLDERS') private readonly EXCLUDED_FOLDERS: string[],
    private prisma: PrismaService,
    private readonly geminiService: GoogleGeminiService,
    @Inject(REQUEST)
    private readonly request: Request & { user?: CreateJwtUserDto },
  ) {}
  private get userId(): string | undefined {
    return this.request.user?.sub; // Now TypeScript should recognize `id`
  }
  private getFileTree(dir: string, recursive: boolean = false): any[] {
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);
    return files
      .filter((file) => !this.EXCLUDED_FOLDERS.includes(file))
      .map((file) => {
        const filePath = path.join(dir, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        return {
          name: file,
          isDirectory,
          path: filePath,
          type: isDirectory ? 'folder' : 'file',
          children:
            isDirectory && recursive ? this.getFileTree(filePath, true) : null,
        };
      });
  }

  async getFilesByDirectory(
    directory: string = '',
    recursive: boolean = false,
  ): Promise<any> {
    try {
      const directoryPath = directory ? directory : process.cwd();
      return this.getFileTree(directoryPath, recursive);
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
  readFile(
    buffer: Buffer,
    filename = 'file',
    asBlob = false,
  ): ReadFileResponseDto {
    const mimeType = mimeLookup(filename) || 'application/octet-stream';
    const content = asBlob
      ? `data:${mimeType};base64,${buffer.toString('base64')}`
      : buffer.toString('utf-8');

    return {
      filename,
      mimeType,
      data: content,
    };
  }
  async readFileAndConvert(
    buffer: Buffer,
    format: FileFormat,
  ): Promise<string> {
    const content = buffer.toString('utf-8');

    const geminiDto: GeminiDto = {
      contents: [
        {
          parts: [
            {
              text: `Convert the following content to ${format.toUpperCase()}:\n\n${content}`,
            },
          ],
        },
      ],
    };

    const response = await this.geminiService.generateContent(geminiDto);

    // Handle response from Gemini (assuming it's in candidates[0].content.parts[0].text)
    const processedText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      'No response from Gemini';

    return processedText;
  }
  async generate(content: string, type: string): Promise<string> {
    let rule = `:\n\nDo not include comments, suggestions, or instructions.`;
    let inst = `Generate the following content a ${type.toUpperCase()}`;

    if (type === 'documentation') {
      inst = `Generate a ${type} for the following content`;
      rule = `Do not include instructions`;
    }
    const geminiDto: GeminiDto = {
      contents: [
        {
          parts: [
            {
              text: `${inst}:\n\n${content}${rule}`,
            },
          ],
        },
      ],
    };

    const response = await this.geminiService.generateContent(geminiDto);

    // Handle response from Gemini (assuming it's in candidates[0].content.parts[0].text)
    const processedText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      'No response from Gemini';

    return processedText;
  }
  create(data: CreateFileDto) {
    return this.prisma.file.create({ data });
  }
  async createFile(name: string, content: string, folderId?: string) {
    if (!this.userId) {
      throw new BadRequestException('User ID is required');
    }

    let parentPath;

    if (!folderId) {
      const path = `/${this.userId}`;
      const parentFolder = await this.prisma.folder.findFirst({
        where: {
          path,
          createdById: this.userId,
        },
      });

      if (!parentFolder)
        throw new NotFoundException('Parent folder does not exist');
      folderId = `${parentFolder.id}`;
    }

    const parentFolder = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!parentFolder)
      throw new NotFoundException('Parent folder does not exist');
    parentPath = parentFolder.path;

    const filePath = `${parentPath}/${name}`;

    const existingFile = await this.prisma.file.findFirst({
      where: {
        name,
        path: filePath,
        folderId,
        createdById: this.userId,
      },
    });

    if (existingFile) {
      const updated = await this.prisma.file.update({
        where: { id: existingFile.id },
        data: {
          content,
        },
      });

      return { message: 'File updated successfully', file: updated };
    }

    const uniqueId = uuidv4();
    const fileKey = folderId
      ? `${folderId}/${uniqueId}-${name}`
      : `${uniqueId}-${name}`;

    // Optional S3 upload logic here...

    const file = await this.prisma.file.create({
      data: {
        name,
        path: filePath,
        content,
        createdById: this.userId,
        folderId,
      },
    });

    return { message: 'File created successfully', file };
  }

  async findAll(where?: Prisma.FileWhereInput) {
    return this.prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        folderId: true,
        path: true,
      },
    });
  }
  findOne(id: string) {
    return this.prisma.file.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateFileDto) {
    return this.prisma.file.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.file.delete({ where: { id } });
  }
}
