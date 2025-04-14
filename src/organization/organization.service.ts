import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateOrganizationDto) {
    return this.prisma.organization.create({ data });
  }

  findAll() {
    return this.prisma.organization.findMany();
  }

  findOne(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateOrganizationDto) {
    return this.prisma.organization.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.organization.delete({ where: { id } });
  }
}
