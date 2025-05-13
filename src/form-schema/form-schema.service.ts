import { Injectable, Inject } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { CreateJwtUserDto } from '../auth/dto/create-jwt-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormSchemaDto } from './dto/create-form-schema.dto';
import { UpdateFormSchemaDto } from './dto/update-form-schema.dto';

@Injectable()
export class FormSchemaService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST)
    private readonly request: Request & { user?: CreateJwtUserDto },
  ) {}

  private get userId(): string | undefined {
    return this.request.user?.sub;
  }

  // Handle the 'createdById' dynamically and other properties in create method
  create(data: CreateFormSchemaDto) {
    // Check if the 'createdById' field exists in the provided schema
    const hasCreatedById = data.hasOwnProperty('createdById');

    // Prepare data object for Prisma create call
    const createData: any = {
      ...data,
    };
    // If related 'createdBy' exists in Prisma schema, use nested connect
    if (this.userId) {
      createData.createdBy = {
        connect: { id: this.userId },
      };
      // Optional: remove createdById if it exists to prevent conflict
      delete createData.createdById;
    }


    // Pass the data to Prisma create method
    return this.prisma.formSchema.create({
      data: createData,
    });
  }

  findAll() {
    return this.prisma.formSchema.findMany();
  }

  findOne(id: string) {
    return this.prisma.formSchema.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateFormSchemaDto) {
    return this.prisma.formSchema.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.formSchema.delete({ where: { id } });
  }
}

