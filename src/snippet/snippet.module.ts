import { Module } from '@nestjs/common';
import { SnippetService } from './snippet.service';
import { SnippetController } from './snippet.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SnippetController],
  providers: [SnippetService],
})
export class SnippetModule {}
