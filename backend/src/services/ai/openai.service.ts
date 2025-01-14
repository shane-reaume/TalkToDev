import OpenAI from 'openai';
import { AIService, AIServiceConfig, AIResponse, AIMessage } from './types';

export class OpenAIService implements AIService {
  private client: OpenAI;
  private model: string;

  constructor(config: AIServiceConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model;
  }

  async generateResponse(messages: AIMessage[], language: string): Promise<AIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 8000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Split response into explanation and code
      const parts = response.split('```');
      const explanation = parts[0].trim();
      const code = parts.length > 1 ? parts[1].replace(/^[a-z]+\n/, '').trim() : '';

      return {
        explanation,
        code,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
} 