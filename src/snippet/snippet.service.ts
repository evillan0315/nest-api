import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

@Injectable()
export class SnippetService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateSnippetDto) {
    return this.prisma.snippet.create({ data });
  }

  findAll() {
    return this.prisma.snippet.findMany();
  }

  findOne(id: string) {
    return this.prisma.snippet.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateSnippetDto) {
    return this.prisma.snippet.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.snippet.delete({ where: { id } });
  }
}
