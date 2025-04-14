import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiUsageDto } from './dto/create-apiUsage.dto';
import { UpdateApiUsageDto } from './dto/update-apiUsage.dto';

@Injectable()
export class ApiUsageService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateApiUsageDto) {
    return this.prisma.apiUsage.create({ data });
  }

  findAll() {
    return this.prisma.apiUsage.findMany();
  }

  findOne(id: string) {
    return this.prisma.apiUsage.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateApiUsageDto) {
    return this.prisma.apiUsage.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.apiUsage.delete({ where: { id } });
  }
}
