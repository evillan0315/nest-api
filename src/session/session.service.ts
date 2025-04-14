import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateSessionDto) {
    return this.prisma.session.create({ data });
  }

  findAll() {
    return this.prisma.session.findMany();
  }

  findOne(id: string) {
    return this.prisma.session.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateSessionDto) {
    return this.prisma.session.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.session.delete({ where: { id } });
  }
}
