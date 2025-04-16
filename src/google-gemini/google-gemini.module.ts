import { Module } from '@nestjs/common';
import { GoogleGeminiController } from './google-gemini.controller';
import { GoogleGeminiService } from './google-gemini.service';
import { PrismaService } from '../prisma/prisma.service';
@Module({
  controllers: [GoogleGeminiController],
  providers: [GoogleGeminiService, PrismaService],
  exports: [GoogleGeminiService],
})
export class GoogleGeminiModule {}
