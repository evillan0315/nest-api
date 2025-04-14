import { Module } from '@nestjs/common';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentationController],
  providers: [DocumentationService],
})
export class DocumentationModule {}
