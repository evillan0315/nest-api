export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  model: string;
}

export interface ToolRequest {
  name: string;
  parameters: any;
}

export interface ToolResponse {
  success: boolean;
  message: string;
  data?: any;
}
