import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleGeminiModule } from '../google-gemini/google-gemini.module';
@Module({
  imports: [PrismaModule, GoogleGeminiModule],
  controllers: [FileController],
  providers: [
    FileService,
    {
      provide: 'EXCLUDED_FOLDERS',
      useValue: ['node_modules', 'dist', '.git'], // Example folders to exclude
    },
  ],
})
export class FileModule {}
