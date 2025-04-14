import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateFolderDto) {
    return this.prisma.folder.create({ data });
  }

  findAll() {
    return this.prisma.folder.findMany();
  }

  findOne(id: string) {
    return this.prisma.folder.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateFolderDto) {
    return this.prisma.folder.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.folder.delete({ where: { id } });
  }
}
