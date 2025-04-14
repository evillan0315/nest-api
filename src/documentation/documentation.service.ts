import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';

@Injectable()
export class DocumentationService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDocumentationDto) {
    return this.prisma.documentation.create({ data });
  }

  findAll() {
    return this.prisma.documentation.findMany();
  }

  findOne(id: string) {
    return this.prisma.documentation.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateDocumentationDto) {
    return this.prisma.documentation.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.documentation.delete({ where: { id } });
  }
}
