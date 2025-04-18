import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { CreateJwtUserDto } from '../auth/dto/create-jwt-user.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { REQUEST } from '@nestjs/core';
import { Request, Express } from 'express';

@Injectable()
export class FolderService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST)
    private readonly request: Request & { user?: CreateJwtUserDto },
  ) {}
  private get userId(): string | undefined {
    return this.request.user?.sub; // Now TypeScript should recognize `id`
  }
  create(data: CreateFolderDto) {
    return this.prisma.folder.create({ data });
  }
  getFolderByPath(path: string) {
    return this.prisma.folder.findFirst({
      where: {
        path,
        createdById: this.userId, // Ensure user only accesses their own folders
      },
      include: {
        files: {
          select: { id: true, name: true, path: true }, // Select only necessary fields
        },
        children: true, // Include subfolders
      },
    });
  }
  async createFolder(name: string, parentId?: string) {
    if (!this.userId) {
      throw new BadRequestException('User ID is required');
    }
    let path = `/${name}`;

    if (parentId) {
      const parentFolder = await this.prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parentFolder) {
        throw new NotFoundException(`Parent folder not found`);
      }

      path = `${parentFolder.path}/${name}`;
    }

    return this.prisma.folder.create({
      data: {
        name,
        path,
        createdById: this.userId, // Ensure it's a string (consider throwing an error if undefined)
        parentId: parentId || null,
      },
    });
  }
  listFolders(parentId?: string) {
    return this.prisma.folder.findMany({
      where: {
        parentId: parentId || null,
        createdById: this.userId, // Filter by user ID
      },
      include: {
        files: {
          select: { id: true, name: true, path: true }, // Select only the necessary fields
        },
        children: true,
      },
    });
  }
  findAll(where?: Prisma.FolderWhereInput) {
    console.log(this.userId);
    return this.prisma.folder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
  findOne(id: string) {
    return this.prisma.folder.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateFolderDto) {
    const folder = await this.prisma.folder.findUnique({ where: { id } });

    if (folder && folder.parentId) {
      const parentFolder = await this.prisma.folder.findUnique({
        where: { id: folder.parentId },
      });

      if (!parentFolder) {
        throw new NotFoundException(`Parent folder not found`);
      }
      data.path = `${parentFolder.path}/${data.name}`;
    }
    return await this.prisma.folder.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.folder.delete({ where: { id } });
  }
}
