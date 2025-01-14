export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIServiceConfig {
  apiKey: string;
  model: string;
}

export interface AIResponse {
  explanation: string;
  code: string;
}

export interface AIService {
  generateResponse(messages: AIMessage[], language: string): Promise<AIResponse>;
} 