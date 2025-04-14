import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateMessageDto) {
    return this.prisma.message.create({ data });
  }

  findAll() {
    return this.prisma.message.findMany();
  }

  findOne(id: string) {
    return this.prisma.message.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateMessageDto) {
    return this.prisma.message.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.message.delete({ where: { id } });
  }
}
