import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePasswordDto } from './dto/create-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class PasswordService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePasswordDto) {
    return this.prisma.password.create({ data });
  }

  findAll() {
    return this.prisma.password.findMany();
  }

  findOne(id: string) {
    return this.prisma.password.findUnique({ where: { id } });
  }

  update(id: string, data: UpdatePasswordDto) {
    return this.prisma.password.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.password.delete({ where: { id } });
  }
}
