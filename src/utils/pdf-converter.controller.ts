import {
  Controller,
  Post,
  Res,
  Body,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  Get,
  Query,
  BadRequestException
} from '@nestjs/common';
import { PdfConverterService } from './pdf-converter.service';
import { Response } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProduces,
  ApiQuery
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfContentDto } from './dto/pdf-content.dto';
import { Express } from 'express';
import { IsString } from 'class-validator';

// DTO for receiving the request body
class ConvertBlobDto {
  @IsString()
  blobData: string; // This will now be a base64 string
}

@ApiTags('PDF - converter') // Grouping under 'pdf' tag in Swagger UI
@Controller('pdf')
export class PdfConverterController {
  constructor(private readonly pdfConverterService: PdfConverterService) {}
  
  @Get('markdown')
  @ApiOperation({ summary: 'Convert Markdown text from query param to PDF' })
  @ApiQuery({ name: 'text', required: true, description: 'Markdown text to convert' })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'PDF file stream',
    schema: { type: 'string', format: 'binary' },
  })
  async getPdfFromMarkdown(@Query('text') text: string, @Res() res: Response) {
    if (!text) throw new BadRequestException('Missing "text" query parameter.');

    const pdfBuffer = await this.pdfConverterService.convertMarkdownToStyledPdf(text);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="markdown.pdf"',
    });

    res.send(pdfBuffer);
  }
  
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a Markdown file to convert into a PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'PDF file stream from uploaded Markdown',
    schema: { type: 'string', format: 'binary' },
  })
  async uploadMarkdownToPdf(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file || file.mimetype !== 'text/markdown') {
      throw new BadRequestException('Please upload a valid .md file.');
    }

    const markdown = file.buffer.toString('utf-8');
    const pdfBuffer = await this.pdfConverterService.convertMarkdownToStyledPdf(markdown);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="upload.pdf"',
    });

    res.send(pdfBuffer);
  }
  @Post('download')
  @ApiOperation({
    summary: 'Convert text/base64/file to PDF and stream as download',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Plain text content' },
        base64: { type: 'string', description: 'Base64 encoded content' },
        filename: { type: 'string', description: 'Optional filename' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Plain text file to convert',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'PDF streamed as file' })
  async downloadPdf(
    @Body() body: PdfContentDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    let content = '';
    if (body.base64) {
      content = Buffer.from(body.base64, 'base64').toString('utf-8');
    } else if (file) {
      content = file.buffer.toString('utf-8');
    } else if (body.text) {
      content = body.text;
    } else {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'No valid content provided.' });
    }

    const pdf = await this.pdfConverterService.convertTextToPdf(content);
    const filename = body.filename?.trim() || 'converted.pdf';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdf.length,
    });

    res.status(HttpStatus.OK).end(pdf);
  }
  @Post('convert')
  @ApiOperation({ summary: 'Convert Blob to PDF' }) // Describes the operation
  @ApiBody({ type: ConvertBlobDto }) // Describes the expected request body
  async convertBlobToPdf(@Body() blobData: ConvertBlobDto): Promise<any> {
    const buffer = Buffer.from(blobData.blobData, 'base64'); // Convert base64 to Buffer
    const pdfBuffer = await this.pdfConverterService.convertBlobToPdf(buffer);
    return pdfBuffer; // This will be displayed in Swagger as the response
  }
}
