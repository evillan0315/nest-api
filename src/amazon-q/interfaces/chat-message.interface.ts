export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  content: string;
  model: string;
}

export interface StreamResponse {
  content: string;
}

export interface ToolResponse {
  success: boolean;
  message?: string;
  content?: string;
  output?: string;
  error?: string | null;
}

export interface ToolRequest {
  toolName: string;
  parameters: any;
}
