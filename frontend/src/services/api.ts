import { Platform } from 'react-native';

const API_URL = Platform.select({
  web: process.env.EXPO_PUBLIC_API_URL,
  native: process.env.EXPO_PUBLIC_API_URL,
}) || 'http://localhost:3000/api';

export interface AIConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  explanation: string;
  code: string;
}

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export class APIService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new APIError(response.status, error.message);
    }
    return response.json();
  }

  static async getModels(): Promise<Record<string, string[]>> {
    try {
      const response = await fetch(`${API_URL}/chat/models`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  static async updateConfig(config: AIConfig): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_URL}/chat/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  }

  static async sendMessage(message: string, language: string, previousMessages: AIMessage[] = []): Promise<AIResponse> {
    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, language, previousMessages }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
} 