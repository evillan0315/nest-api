import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDatabaseConnectionDto } from './dto/create-databaseConnection.dto';
import { UpdateDatabaseConnectionDto } from './dto/update-databaseConnection.dto';

@Injectable()
export class DatabaseConnectionService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDatabaseConnectionDto) {
    return this.prisma.databaseConnection.create({ data });
  }

  findAll() {
    return this.prisma.databaseConnection.findMany();
  }

  findOne(id: string) {
    return this.prisma.databaseConnection.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateDatabaseConnectionDto) {
    return this.prisma.databaseConnection.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.databaseConnection.delete({ where: { id } });
  }
}
