import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule
import { GoogleGeminiModule } from '../google-gemini/google-gemini.module';
@Module({
  imports: [PrismaModule, GoogleGeminiModule],
  providers: [
    FileService,
    {
      provide: 'EXCLUDED_FOLDERS',
      useValue: ['node_modules', 'dist', '.git'], // Example folders to exclude
    },
  ],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
