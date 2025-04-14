import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class AmazonQService {
  private readonly logger = new Logger(AmazonQService.name);
  private readonly bedrockClient: BedrockRuntimeClient;
  private readonly modelId: string;
  private readonly useMockResponses = false; // Use real responses

  constructor(private configService: ConfigService) {
    // Initialize the Bedrock client with AWS credentials
    this.bedrockClient = new BedrockRuntimeClient({
      region: this.configService.get<string>('AWS_REGION') || 'ap-southeast-2',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey:
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });

    // Get model ID from config or use default
    this.modelId =
      this.configService.get<string>('BEDROCK_MODEL_ID') ||
      'anthropic.claude-instant-v1';

    this.logger.log(
      `Amazon Q Service initialized with ${this.useMockResponses ? 'mock responses' : `Bedrock client using model: ${this.modelId}`}`,
    );
  }

  /**
   * Send a chat request to Amazon Q
   */
  async chat(messages: any[], systemPrompt?: string) {
    try {
      this.logger.log('Processing chat request');
      const prompt = this.formatPrompt(messages, systemPrompt);

      // Use mock responses if enabled or if there's an issue with Bedrock
      if (this.useMockResponses) {
        this.logger.log('Using mock response');
        return this.getMockResponse(messages);
      }

      // Always use real Bedrock responses
      // Format request based on model type
      let params;

      if (this.modelId.includes('anthropic')) {
        // Claude models use this format
        params = {
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4096,
            temperature: 0.7,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        };
      } else if (this.modelId.includes('titan')) {
        // Amazon Titan models use this format
        params = {
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            inputText: prompt,
            textGenerationConfig: {
              maxTokenCount: 4096,
              temperature: 0.7,
              topP: 0.9,
            },
          }),
        };
      } else {
        // Default format for other models
        params = {
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            prompt: prompt,
            max_tokens: 4096,
            temperature: 0.7,
          }),
        };
      }

      this.logger.log(`Sending request to Bedrock with model: ${this.modelId}`);
      const command = new InvokeModelCommand(params);
      const response = await this.bedrockClient.send(command);

      // Parse the response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // Extract content based on model type
      let content = '';
      if (this.modelId.includes('anthropic')) {
        content = responseBody.completion || responseBody.content;
      } else if (this.modelId.includes('titan')) {
        content =
          responseBody.results?.[0]?.outputText || responseBody.outputText;
      } else {
        content =
          responseBody.completion ||
          responseBody.generated_text ||
          responseBody.text;
      }

      return {
        content: content,
        model: this.modelId,
      };
    } catch (error) {
      this.logger.error(
        `Error in Amazon Q chat: ${error.message}`,
        error.stack,
      );

      // Return a fallback response in case of error
      return {
        content: `Error connecting to Amazon Q: ${error.message}. Using mock response instead.`,
        model: 'error',
      };
    }
  }

  /**
   * Stream a chat response from Amazon Q
   */
  async streamChat(messages: any[], systemPrompt?: string) {
    try {
      this.logger.log('Processing stream chat request');
      const prompt = this.formatPrompt(messages, systemPrompt);

      // Use mock stream if enabled or if there's an issue with Bedrock
      if (this.useMockResponses) {
        this.logger.log('Using mock stream');
        return this.getMockStream(messages);
      }

      // Always use real Bedrock streaming
      // Format request based on model type
      let params;

      if (this.modelId.includes('anthropic')) {
        // Claude models use this format
        params = {
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4096,
            temperature: 0.7,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        };
      } else if (this.modelId.includes('titan')) {
        // Amazon Titan models use this format
        params = {
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            inputText: prompt,
            textGenerationConfig: {
              maxTokenCount: 4096,
              temperature: 0.7,
              topP: 0.9,
            },
          }),
        };
      } else {
        // Default format for other models
        params = {
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            prompt: prompt,
            max_tokens: 4096,
            temperature: 0.7,
          }),
        };
      }

      this.logger.log(
        `Sending streaming request to Bedrock with model: ${this.modelId}`,
      );
      const command = new InvokeModelWithResponseStreamCommand(params);
      const response = await this.bedrockClient.send(command);

      return response.body;
    } catch (error) {
      this.logger.error(
        `Error in Amazon Q stream chat: ${error.message}`,
        error.stack,
      );
      throw new Error(
        `Failed to connect to Amazon Q: ${error.message}. Using mock stream instead.`,
      );
    }
  }

  /**
   * Execute a tool requested by Amazon Q
   */
  async executeTool(toolName: string, parameters: any) {
    this.logger.log(
      `Executing tool: ${toolName} with parameters: ${JSON.stringify(parameters)}`,
    );

    // Implement tool execution logic based on the Amazon Q CLI tools
    switch (toolName) {
      case 'fs_read':
        return this.executeFileRead(parameters);
      case 'fs_write':
        return this.executeFileWrite(parameters);
      case 'execute_bash':
        return this.executeBashCommand(parameters);
      case 'use_aws':
        return this.executeAwsCommand(parameters);
      default:
        throw new Error(`Unsupported tool: ${toolName}`);
    }
  }

  /**
   * Format the prompt for Amazon Q
   */
  private formatPrompt(messages: any[], systemPrompt?: string): string {
    let prompt = '';

    // Add system prompt if provided
    if (systemPrompt) {
      prompt += `System: ${systemPrompt}\n\n`;
    }

    // Add conversation history
    messages.forEach((message) => {
      const role = message.role === 'user' ? 'Human' : 'Assistant';
      prompt += `${role}: ${message.content}\n\n`;
    });

    // Add final prompt marker
    prompt += 'Assistant: ';

    return prompt;
  }

  /**
   * Execute file read operation (similar to fs_read tool)
   */
  private async executeFileRead(parameters: any) {
    try {
      const { path: filePath, mode } = parameters;

      // Basic security check - prevent reading sensitive files
      if (this.isPathSensitive(filePath)) {
        return {
          success: false,
          message: 'Access denied: Cannot read sensitive system files',
        };
      }

      if (mode === 'Directory') {
        // List directory contents
        const { stdout } = await execPromise(`ls -la ${filePath}`);
        return { success: true, content: stdout };
      } else {
        // Read file content
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return { success: true, content };
      }
    } catch (error) {
      this.logger.error(`Error reading file: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Execute file write operation (similar to fs_write tool)
   */
  private async executeFileWrite(parameters: any) {
    try {
      const {
        path: filePath,
        command,
        file_text,
        old_str,
        new_str,
      } = parameters;

      // Basic security check - prevent writing to sensitive files
      if (this.isPathSensitive(filePath)) {
        return {
          success: false,
          message: 'Access denied: Cannot write to sensitive system files',
        };
      }

      switch (command) {
        case 'create':
          await fs.promises.writeFile(filePath, file_text);
          return { success: true, message: `File created: ${filePath}` };

        case 'append':
          await fs.promises.appendFile(filePath, new_str);
          return { success: true, message: `Content appended to: ${filePath}` };

        case 'str_replace':
          const content = await fs.promises.readFile(filePath, 'utf-8');
          if (!content.includes(old_str)) {
            return {
              success: false,
              message: 'String to replace not found in file',
            };
          }
          const newContent = content.replace(old_str, new_str);
          await fs.promises.writeFile(filePath, newContent);
          return { success: true, message: `String replaced in: ${filePath}` };

        default:
          return { success: false, message: `Unsupported command: ${command}` };
      }
    } catch (error) {
      this.logger.error(`Error writing file: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Execute bash command (similar to execute_bash tool)
   */
  private async executeBashCommand(parameters: any) {
    try {
      const { command } = parameters;

      // Basic security check - prevent dangerous commands
      if (this.isCommandDangerous(command)) {
        return {
          success: false,
          message:
            'Access denied: Command contains potentially dangerous operations',
        };
      }

      const { stdout, stderr } = await execPromise(command);
      return {
        success: true,
        output: stdout,
        error: stderr || null,
      };
    } catch (error) {
      this.logger.error(`Error executing bash command: ${error.message}`);
      return {
        success: false,
        message: error.message,
        error: error.stderr || null,
      };
    }
  }

  /**
   * Execute AWS CLI command (similar to use_aws tool)
   */
  private async executeAwsCommand(parameters: any) {
    try {
      const {
        service_name,
        operation_name,
        parameters: awsParams,
        region,
      } = parameters;

      // Basic security check - prevent dangerous operations
      if (this.isAwsOperationDangerous(service_name, operation_name)) {
        return {
          success: false,
          message: 'Access denied: AWS operation not allowed',
        };
      }

      // Format AWS CLI command
      let command = `aws ${service_name} ${operation_name}`;

      // Add region if specified
      if (region) {
        command += ` --region ${region}`;
      }

      // Add parameters
      if (awsParams) {
        Object.entries(awsParams).forEach(([key, value]) => {
          if (value === '') {
            // Handle flag parameters
            command += ` --${key}`;
          } else {
            // Handle key-value parameters
            command += ` --${key} '${value}'`;
          }
        });
      }

      const { stdout, stderr } = await execPromise(command);
      return {
        success: true,
        output: stdout,
        error: stderr || null,
      };
    } catch (error) {
      this.logger.error(`Error executing AWS command: ${error.message}`);
      return {
        success: false,
        message: error.message,
        error: error.stderr || null,
      };
    }
  }

  /**
   * Check if a file path is sensitive
   */
  private isPathSensitive(filePath: string): boolean {
    const sensitivePatterns = [
      '/etc/shadow',
      '/etc/passwd',
      '/etc/sudoers',
      '/.ssh/',
      '/proc/',
      '/sys/',
      '.env',
    ];

    return sensitivePatterns.some((pattern) => filePath.includes(pattern));
  }

  /**
   * Check if a command is potentially dangerous
   */
  private isCommandDangerous(command: string): boolean {
    const dangerousPatterns = [
      'rm -rf /',
      'mkfs',
      'dd if=/dev/zero',
      '> /dev/sda',
      ':(){:|:&};:',
      'chmod -R 777 /',
      'mv /* /dev/null',
    ];

    return dangerousPatterns.some((pattern) => command.includes(pattern));
  }

  /**
   * Check if an AWS operation is potentially dangerous
   */
  private isAwsOperationDangerous(service: string, operation: string): boolean {
    const dangerousOperations = [
      { service: 'ec2', operation: 'terminate-instances' },
      { service: 'rds', operation: 'delete-db-instance' },
      { service: 's3', operation: 'rb' }, // Remove bucket
      { service: 'iam', operation: 'delete-user' },
      { service: 'lambda', operation: 'delete-function' },
    ];

    return dangerousOperations.some(
      (op) => op.service === service && op.operation === operation,
    );
  }

  /**
   * Get a mock response for development/testing
   */
  private getMockResponse(messages: any[]): any {
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.content || '';

    let response = "I'm Amazon Q, an AI assistant built by AWS. ";

    if (
      userQuery.toLowerCase().includes('hello') ||
      userQuery.toLowerCase().includes('hi')
    ) {
      response +=
        'Hello! How can I help you today with your development tasks?';
    } else if (userQuery.toLowerCase().includes('aws')) {
      response +=
        'AWS offers a wide range of cloud services. What specific AWS service are you interested in?';
    } else if (userQuery.toLowerCase().includes('terminal')) {
      response +=
        'The terminal is a powerful interface for interacting with your system. What command are you trying to run?';
    } else if (userQuery.toLowerCase().includes('working')) {
      response +=
        'Yes, the mock response system is working correctly! This is a simulated response while we work on setting up proper Bedrock access.';
    } else {
      response +=
        "I'm here to help with your development tasks. Could you provide more details about what you're working on?";
    }

    return {
      content: response,
      model: 'mock-model',
    };
  }

  /**
   * Get a mock stream for development/testing
   */
  private async *getMockStream(messages: any[]): AsyncGenerator<any> {
    const mockResponse = this.getMockResponse(messages);
    const content = mockResponse.content;

    // Split the content into chunks to simulate streaming
    const chunkSize = 10;
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.substring(i, i + chunkSize);

      // Create a mock chunk object similar to what Bedrock would return
      const mockChunk = {
        chunk: {
          bytes: new TextEncoder().encode(
            JSON.stringify({ outputText: chunk }),
          ),
        },
      };

      yield mockChunk;

      // Add a small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}
