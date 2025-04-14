import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AmazonQService } from './amazon-q.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3001',
      'http://localhost:5000',
    ],
    credentials: true,
  },
  namespace: 'amazon-q',
})
export class AmazonQGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AmazonQGateway.name);
  private clientConversations: Map<string, any[]> = new Map();

  @WebSocketServer()
  server: Server;

  constructor(private readonly amazonQService: AmazonQService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to Amazon Q: ${client.id}`);

    // Initialize conversation history for this client
    this.clientConversations.set(client.id, []);

    // Send welcome message
    client.emit('welcome', {
      message: 'Connected to Amazon Q service',
      clientId: client.id,
    });

    // Join the amazon-q namespace
    client.emit('connect_namespace', 'amazon-q');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from Amazon Q: ${client.id}`);

    // Clean up conversation history
    this.clientConversations.delete(client.id);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Ping received from client: ${client.id}`);
    return { event: 'pong' };
  }

  @SubscribeMessage('chat_message')
  async handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { message: string; directory?: string; modelId?: string },
  ) {
    try {
      this.logger.log(
        `Chat message received from client ${client.id}: ${data.message.substring(0, 50)}...`,
      );

      // Get the current conversation history
      const conversationHistory = this.clientConversations.get(client.id) || [];

      // Add the user message to the conversation history
      conversationHistory.push({
        role: 'user',
        content: data.message,
      });

      // Create a system prompt with context
      const systemPrompt = `You are Amazon Q, an AI assistant helping with terminal commands and development tasks. 
      ${data.directory ? `The user is currently in directory: ${data.directory}` : ''}
      Provide helpful, concise responses. When suggesting commands, be specific and explain what they do.`;

      // Send the request to Amazon Q
      const response = await this.amazonQService.chat(
        conversationHistory,
        systemPrompt,
      );

      // Add the assistant response to the conversation history
      conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      // Update the conversation history
      this.clientConversations.set(client.id, conversationHistory);

      // Send the response back to the client
      client.emit('chat_response', response);

      return { event: 'chat_response', data: response };
    } catch (error) {
      this.logger.error(`Error in chat: ${error.message}`, error.stack);
      client.emit('error', { message: error.message });
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('stream_chat')
  async handleStreamChat(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { message: string; directory?: string; modelId?: string },
  ) {
    try {
      this.logger.log(
        `Stream chat message received from client ${client.id}: ${data.message.substring(0, 50)}...`,
      );

      // Get the current conversation history
      const conversationHistory = this.clientConversations.get(client.id) || [];

      // Add the user message to the conversation history
      conversationHistory.push({
        role: 'user',
        content: data.message,
      });

      // Create a system prompt with context
      const systemPrompt = `You are Amazon Q, an AI assistant helping with terminal commands and development tasks. 
      ${data.directory ? `The user is currently in directory: ${data.directory}` : ''}
      Provide helpful, concise responses. When suggesting commands, be specific and explain what they do.`;

      // Send the streaming request to Amazon Q
      const stream = await this.amazonQService.streamChat(
        conversationHistory,
        systemPrompt,
      );

      let fullResponse = '';

      // Process the stream and send chunks to the client
      if (stream) {
        for await (const chunk of stream) {
          if (chunk.chunk?.bytes) {
            const decodedChunk = JSON.parse(
              new TextDecoder().decode(chunk.chunk.bytes),
            );

            // Extract the text from the chunk based on model type
            let chunkText = '';
            if (client.handshake.query.modelId?.toString().includes('titan')) {
              chunkText = decodedChunk.outputText || '';
            } else if (
              client.handshake.query.modelId?.toString().includes('anthropic')
            ) {
              chunkText = decodedChunk.completion || '';
            } else {
              chunkText =
                decodedChunk.outputText ||
                decodedChunk.completion ||
                decodedChunk.text ||
                '';
            }

            fullResponse += chunkText;

            // Send the chunk to the client
            client.emit('stream_response', { content: chunkText });
          }
        }

        // Add the complete assistant response to the conversation history
        conversationHistory.push({
          role: 'assistant',
          content: fullResponse,
        });

        // Update the conversation history
        this.clientConversations.set(client.id, conversationHistory);
      }

      // Signal the end of the stream
      client.emit('stream_end');
    } catch (error) {
      this.logger.error(`Error in stream chat: ${error.message}`, error.stack);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('execute_tool')
  async handleExecuteTool(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { toolName: string; parameters: any },
  ) {
    try {
      this.logger.log(
        `Tool execution requested by client ${client.id}: ${data.toolName}`,
      );

      const result = await this.amazonQService.executeTool(
        data.toolName,
        data.parameters,
      );

      client.emit('tool_response', result);
      return { event: 'tool_response', data: result };
    } catch (error) {
      this.logger.error(`Error executing tool: ${error.message}`, error.stack);
      client.emit('error', { message: error.message });
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('terminal_command')
  async handleTerminalCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { command: string; sessionId: string },
  ) {
    try {
      this.logger.log(
        `Terminal command requested by client ${client.id}: ${data.command}`,
      );

      // Execute the command and get the result
      const result = await this.amazonQService.executeTool('execute_bash', {
        command: data.command,
      });

      // Send the result back to the client
      client.emit('terminal_response', result);
      return { event: 'terminal_response', data: result };
    } catch (error) {
      this.logger.error(
        `Error executing terminal command: ${error.message}`,
        error.stack,
      );
      client.emit('error', { message: error.message });
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('clear_conversation')
  handleClearConversation(@ConnectedSocket() client: Socket) {
    this.logger.log(`Clearing conversation for client ${client.id}`);

    // Clear the conversation history for this client
    this.clientConversations.set(client.id, []);

    client.emit('conversation_cleared');
    return { event: 'conversation_cleared' };
  }

  @SubscribeMessage('join_namespace')
  handleJoinNamespace(
    @ConnectedSocket() client: Socket,
    @MessageBody() namespace: string,
  ) {
    this.logger.log(`Client ${client.id} joining namespace: ${namespace}`);
    client.join(namespace);
    return { event: 'joined_namespace', namespace };
  }
}
