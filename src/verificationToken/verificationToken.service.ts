import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVerificationTokenDto } from './dto/create-verificationToken.dto';
import { UpdateVerificationTokenDto } from './dto/update-verificationToken.dto';

@Injectable()
export class VerificationTokenService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateVerificationTokenDto) {
    return this.prisma.verificationToken.create({ data });
  }

  findAll() {
    return this.prisma.verificationToken.findMany();
  }

  findOne(id: string) {
    return this.prisma.verificationToken.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateVerificationTokenDto) {
    return this.prisma.verificationToken.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.verificationToken.delete({ where: { id } });
  }
}
