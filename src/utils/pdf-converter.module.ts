import { Module } from '@nestjs/common';
import { PdfConverterService } from './pdf-converter.service';
import { PdfConverterController } from './pdf-converter.controller';
@Module({
  providers: [PdfConverterService],
  controllers: [PdfConverterController],
  exports: [PdfConverterService],
})
export class PdfConverterModule {}
