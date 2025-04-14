import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';

@Injectable()
export class ComponentService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateComponentDto) {
    return this.prisma.component.create({ data });
  }

  findAll() {
    return this.prisma.component.findMany();
  }

  findOne(id: string) {
    return this.prisma.component.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateComponentDto) {
    return this.prisma.component.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.component.delete({ where: { id } });
  }
}
