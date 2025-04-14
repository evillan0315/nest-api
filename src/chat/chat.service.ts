import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateChatDto) {
    return this.prisma.chat.create({ data });
  }

  findAll() {
    return this.prisma.chat.findMany();
  }

  findOne(id: string) {
    return this.prisma.chat.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateChatDto) {
    return this.prisma.chat.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.chat.delete({ where: { id } });
  }
}
