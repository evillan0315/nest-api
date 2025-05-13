import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Body,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { timeAgo, parseDurationToMs, formatUnixTimestamp } from './date';
import { capitalize, toKebabCase, reverseString, truncateText } from './string';
import { parseInsertSqlToJson, parseSqlToJson, jsonToInsertSql } from './sql';
import { MarkdownDto } from './dto/markdown.dto';
import { UploadEnvDto } from './dto/upload-env.dto';
import { UploadJsonDto } from './dto/upload-json.dto';
import { JsonBodyDto } from './dto/json-body.dto';

import {
  uniqueArray,
  copyToClipboardSync,
  copyToClipboardAsync,
} from './helper';

function parseEnvToJsonString(content: string): Record<string, string> {
  const lines = content.split('\n');
  const result: Record<string, string> = {};

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    const [key, ...rest] = line.split('=');
    const value = rest
      .join('=')
      .trim()
      .replace(/^"(.*)"$/, '$1');
    result[key.trim()] = value;
  }

  return result;
}

@ApiTags('Utilities')
@Controller('utils')
export class UtilsController {
  @Post('json-to-env')
  @ApiOperation({
    summary: 'Upload JSON file or provide JSON body to convert to .env',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        json: {
          type: 'object',
          additionalProperties: { type: 'string' },
          example: {
            DB_HOST: 'localhost',
            DB_USER: 'admin',
          },
        },
        download: {
          type: 'boolean',
          example: true,
          default: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns .env as a file or raw string based on download option',
  })
  @UseInterceptors(FileInterceptor('file'))
  async jsonToEnv(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: JsonBodyDto,
    @Res() res: Response,
  ) {
    let json: Record<string, string>;

    if (file) {
      try {
        json = JSON.parse(file.buffer.toString('utf-8'));
      } catch {
        throw new HttpException(
          'Invalid JSON file format',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (body?.json) {
      json = body.json;
    } else {
      throw new HttpException(
        'Either file or JSON body must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const envContent = Object.entries(json)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const shouldDownload = body.download ?? false;

    if (shouldDownload) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=".env"');
      res.send(envContent);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.send(envContent);
    }
  }
  @Post('env-to-json')
  @ApiOperation({
    summary: 'Convert uploaded .env file to JSON',
    description:
      'Parses a .env file and returns its contents as a JSON object.',
  })
  @ApiBody({
    description: 'Upload a .env file',
    type: UploadEnvDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Successfully parsed .env file.',
    schema: {
      example: {
        DB_HOST: 'localhost',
        DB_USER: 'root',
        DB_PASS: 'secret',
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async envToJson(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const content = file.buffer.toString('utf-8');

    try {
      const parsed = dotenv.parse(content);
      return parsed;
    } catch (err) {
      throw new HttpException(
        'Failed to parse .env file',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Post('extract-title')
  @ApiOperation({ summary: 'Extracts the title from Markdown content' })
  @ApiResponse({
    status: 200,
    description: 'Title successfully extracted',
    schema: {
      example: {
        title: 'Hello World',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  extractTitle(@Body() body: MarkdownDto) {
    const match = body.content.match(/^#{1,2}\s+(.*)/m);
    const title = match ? match[1].trim() : null;
    return title;
  }

  // Utility helper functions
  @Post('unique')
  @ApiOperation({ summary: 'Remove duplicates from an array' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        array: {
          type: 'array',
          items: { type: 'string' },
          example: ['apple', 'banana', 'apple'],
        },
      },
    },
  })
  unique(@Body('array') array: any[]) {
    return { unique: uniqueArray(array) };
  }

  // Utili for handling SQL
  @Post('parse-select')
  @ApiOperation({
    summary: 'Convert SELECT SQL to JSON',
    description:
      'Parses a simple SELECT SQL string into a structured JSON object.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          example: 'SELECT id, name FROM users WHERE active = 1',
        },
      },
    },
  })
  parseSelect(@Body('sql') sql: string) {
    try {
      return parseSqlToJson(sql);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('parse-insert')
  @ApiOperation({
    summary: 'Convert INSERT SQL to JSON',
    description:
      'Parses a simple INSERT SQL string into a structured JSON object.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          example: "INSERT INTO users (id, name) VALUES (1, 'Alice')",
        },
      },
    },
  })
  parseInsert(@Body('sql') sql: string) {
    try {
      return parseInsertSqlToJson(sql);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('json-to-insert')
  @ApiOperation({
    summary: 'Convert JSON to INSERT SQL',
    description: 'Generates a simple INSERT SQL string from a JSON object.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        table: { type: 'string', example: 'users' },
        data: {
          type: 'object',
          example: { id: 1, name: 'Alice' },
        },
      },
    },
  })
  jsonToSql(@Body() body: { table: string; data: Record<string, any> }) {
    try {
      return { sql: jsonToInsertSql(body) };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  //Utility functions for dates
  @Post('time-ago')
  @ApiOperation({
    summary: 'Convert milliseconds to relative time',
    description:
      'Converts a number of milliseconds into a human-readable relative time string. Example: 60000 becomes "1 minute ago".',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ms: {
          type: 'number',
          example: 60000,
          description: 'Milliseconds since an event occurred',
        },
      },
    },
  })
  timeAgo(@Body('ms') ms: number) {
    return { ago: timeAgo(ms) };
  }

  @Post('parse-duration')
  @ApiOperation({
    summary: 'Parse short duration string into milliseconds',
    description:
      'Parses duration strings like "1d", "2h", "30m", or "45s" into milliseconds. Useful for setting expiration times and timeouts.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        duration: {
          type: 'string',
          example: '2h',
          description:
            'Short-form duration string. Valid formats: 1d (day), 2h (hour), 30m (minute), 45s (second)',
        },
      },
    },
  })
  parse(@Body('duration') duration: string) {
    return { ms: parseDurationToMs(duration) };
  }

  @Post('format-timestamp')
  @ApiOperation({
    summary: 'Format Unix timestamp into human-readable date',
    description:
      'Formats a Unix timestamp (in seconds) into a readable date string in UTC. Example: 1713190822 → "Apr 15, 2024, 10:00:22 AM".',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timestamp: {
          type: 'number',
          example: 1713190822,
          description: 'Unix timestamp in seconds (not milliseconds)',
        },
      },
    },
  })
  format(@Body('timestamp') timestamp: number) {
    return { formatted: formatUnixTimestamp(timestamp) };
  }
  // Utility functions for strings
  @Post('capitalize')
  @ApiOperation({
    summary: 'Capitalize the first letter',
    description:
      'Takes a lowercase string and returns it with the first character converted to uppercase. Example: "hello" becomes "Hello".',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'hello world' },
      },
    },
  })
  capitalize(@Body('text') text: string) {
    return { result: capitalize(text) };
  }

  @Post('kebab-case')
  @ApiOperation({
    summary: 'Convert to kebab-case',
    description:
      'Transforms a sentence or camelCase string into kebab-case. Example: "Hello World" or "helloWorldTest" becomes "hello-world" or "hello-world-test".',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Hello World Test' },
      },
    },
  })
  kebabCase(@Body('text') text: string) {
    return { result: toKebabCase(text) };
  }

  @Post('reverse')
  @ApiOperation({
    summary: 'Reverse a string',
    description:
      'Returns the string characters in reverse order. Example: "solidjs" becomes "sjdilos".',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'solidjs' },
      },
    },
  })
  reverse(@Body('text') text: string) {
    return { result: reverseString(text) };
  }

  @Post('truncate')
  @ApiOperation({
    summary: 'Truncate long text with ellipsis',
    description:
      'Shortens a string to a maximum number of characters and appends "..." if it exceeds that length. Example: "This is a long message" becomes "This is a long mes..." (when maxLength is 20).',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          example:
            'This is a very long sentence that needs to be trimmed down.',
        },
        maxLength: { type: 'number', example: 20 },
      },
    },
  })
  truncate(@Body() body: { text: string; maxLength: number }) {
    return { result: truncateText(body.text, body.maxLength) };
  }
}
