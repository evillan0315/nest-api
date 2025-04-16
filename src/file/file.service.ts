import { Injectable, Inject } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

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
  ) {}
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
  readFile(buffer: Buffer, filename = 'file', asBlob = false): ReadFileResponseDto {
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
  create(data: CreateFileDto) {
    return this.prisma.file.create({ data });
  }

  findAll() {
    return this.prisma.file.findMany();
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
