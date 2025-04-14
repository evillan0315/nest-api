import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-apiKey.dto';
import { UpdateApiKeyDto } from './dto/update-apiKey.dto';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateApiKeyDto) {
    return this.prisma.apiKey.create({ data });
  }

  findAll() {
    return this.prisma.apiKey.findMany();
  }

  findOne(id: string) {
    return this.prisma.apiKey.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateApiKeyDto) {
    return this.prisma.apiKey.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.apiKey.delete({ where: { id } });
  }
}
