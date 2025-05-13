import { Module } from '@nestjs/common';
import { FormSchemaService } from './form-schema.service';
import { FormSchemaController } from './form-schema.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FormSchemaController],
  providers: [FormSchemaService]
})
export class FormSchemaModule {}

