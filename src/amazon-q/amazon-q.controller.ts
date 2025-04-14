import { Controller, Post, Body, Get, UseGuards, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AmazonQService } from './amazon-q.service';
import { CognitoGuard } from '../aws/cognito/cognito.guard';
import {
  ChatRequestDto,
  ChatMessageDto,
  ToolRequestDto,
} from './dto/chat-request.dto';

@ApiTags('Amazon Q')
@Controller('amazon-q')
@ApiBearerAuth()
export class AmazonQController {
  private readonly logger = new Logger(AmazonQController.name);

  constructor(private readonly amazonQService: AmazonQService) {}

  @Post('chat')
  @UseGuards(CognitoGuard)
  @ApiOperation({ summary: 'Send a chat message to Amazon Q' })
  @ApiResponse({ status: 200, description: 'Returns the chat response' })
  async chat(@Body() body: ChatRequestDto) {
    this.logger.log('Received chat request');
    return this.amazonQService.chat(body.messages, body.systemPrompt);
  }

  @Post('execute-tool')
  @UseGuards(CognitoGuard)
  @ApiOperation({ summary: 'Execute a tool via Amazon Q' })
  @ApiResponse({
    status: 200,
    description: 'Returns the tool execution result',
  })
  async executeTool(@Body() body: ToolRequestDto) {
    this.logger.log(`Received tool execution request: ${body.toolName}`);
    return this.amazonQService.executeTool(body.toolName, body.parameters);
  }

  @Get('health')
  @ApiOperation({ summary: 'Check the health of the Amazon Q service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Amazon Q',
    };
  }
}
