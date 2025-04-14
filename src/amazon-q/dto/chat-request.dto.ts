import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @ApiProperty({
    description: 'Role of the message sender (user or assistant)',
  })
  @IsString()
  role: string;

  @ApiProperty({ description: 'Content of the message' })
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({
    description: 'Array of chat messages',
    type: [ChatMessageDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiProperty({
    description: 'Optional system prompt to guide the assistant',
    required: false,
  })
  @IsOptional()
  @IsString()
  systemPrompt?: string;
}

export class ToolRequestDto {
  @ApiProperty({ description: 'Name of the tool to execute' })
  @IsString()
  toolName: string;

  @ApiProperty({ description: 'Parameters for the tool execution' })
  @IsObject()
  parameters: any;
}
