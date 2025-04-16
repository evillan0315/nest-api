import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { timeAgo, parseDurationToMs, formatUnixTimestamp } from './date';
import { capitalize, toKebabCase, reverseString, truncateText } from './string';
import { parseInsertSqlToJson, parseSqlToJson, jsonToInsertSql } from './sql';
import {
  uniqueArray,
  copyToClipboardSync,
  copyToClipboardAsync,
} from './helper';

@ApiTags('Utilities')
@Controller('utils')
export class UtilsController {
  /**
   * Copies the given text to the clipboard asynchronously.
   *
   * This function uses the Clipboard API to perform the copy operation. It provides
   * user feedback via an alert (for demonstration purposes). In a real application,
   * you would likely use a more user-friendly method like a toast notification.
   *
   * @param text The text to copy to the clipboard.
   * @returns A Promise that resolves when the text is successfully copied, or rejects
   *          if an error occurs (e.g., Clipboard API not supported). The Promise does
   *          not resolve with a value (void).
   * @throws {Error} If the Clipboard API is not supported by the browser.
   */
  @Post('copy-async')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Hello, World!' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully copied text to clipboard asynchronously.',
  })
  async copyToClipboardAsync(@Body('text') text: string): Promise<void> {
    return copyToClipboardAsync(text); // Calling the function from helper.ts
  }

  /**
   * Copies the given text to the clipboard synchronously (if possible).
   *
   * This function attempts to use the Clipboard API to copy the text. If the
   * Clipboard API is not available or an error occurs, it will log an error
   * to the console but will not throw an exception. Synchronous clipboard
   * access is restricted by browsers for security reasons, so this function
   * may not always work as expected. It's generally better to use the
   * asynchronous `copyToClipboardAsync` function if possible.
   *
   * @param text The text to copy to the clipboard.
   */
  @Post('copy-sync')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Hello, World!' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully copied text to clipboard synchronously (may not always succeed).',
  })
  copyToClipboardSync(@Body('text') text: string): void {
    copyToClipboardSync(text); // Calling the function from helper.ts
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
