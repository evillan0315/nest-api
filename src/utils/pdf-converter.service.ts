import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ApiOperation } from '@nestjs/swagger';
import * as markdownIt from 'markdown-it';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfConverterService implements OnModuleDestroy {
  private md = new markdownIt();
  private browser: puppeteer.Browser;

  async convertMarkdownToStyledPdf(markdown: string): Promise<Buffer> {
    const htmlContent = this.md.render(markdown);
    const fullHtml = this.getFullHtmlTemplate(htmlContent);

    // Lazy load browser
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await this.browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', bottom: '40px', left: '30px', right: '30px' },
    });

    await page.close();
    return Buffer.from(pdfBuffer);
  }

  private getFullHtmlTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Markdown PDF</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 2rem;
            color: #333;
            line-height: 1.6;
          }
          h1, h2, h3 {
            color: #222;
          }
          pre {
            background: #f6f8fa;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
          }
          code {
            background-color: #f2f2f2;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: monospace;
          }
          blockquote {
            border-left: 4px solid #ccc;
            padding-left: 1rem;
            color: #555;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 0.5rem;
            border: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }

  @ApiOperation({ summary: 'Convert a text into a PDF' })
  async convertTextToPdf(text: string): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 12;
    const margin = 50;
    const lineHeight = fontSize * 1.2;

    const pageWidth = 612; // Letter size width (8.5in * 72)
    const pageHeight = 792; // Letter size height (11in * 72)
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const linesPerPage = Math.floor(usableHeight / lineHeight);

    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth < usableWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    for (let i = 0; i < lines.length; i += linesPerPage) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const chunk = lines.slice(i, i + linesPerPage);

      chunk.forEach((line, j) => {
        page.drawText(line, {
          x: margin,
          y: pageHeight - margin - j * lineHeight,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
  @ApiOperation({ summary: 'Convert a Buffer into a PDF buffer' })
  async convertBlobToPdf(buffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Convert the buffer to a UTF-8 string
    const text = buffer.toString('utf-8');

    // Draw text on the PDF
    page.drawText(text, {
      x: 50,
      y: height - 50,
      size: 12,
    });

    // Serialize to Uint8Array and convert to Node.js Buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
