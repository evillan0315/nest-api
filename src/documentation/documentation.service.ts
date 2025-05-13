import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';

@Injectable()
export class DocumentationService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDocumentationDto) {
    return this.prisma.documentation.create({ data });
  }
  async findAllPaginated(
    where: Prisma.DocumentationWhereInput = {},
    page = 1,
    pageSize = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const take = Number(pageSize); // Ensure it's a number

    const [items, total] = await this.prisma.$transaction([
      this.prisma.documentation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.documentation.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
  findAll(
    where?: Prisma.DocumentationWhereInput,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;

    return this.prisma.documentation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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
