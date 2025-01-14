import Anthropic from '@anthropic-ai/sdk';
import { AIService, AIServiceConfig, AIResponse, AIMessage } from './types';

export class AnthropicService implements AIService {
  private client: Anthropic;
  private model: string;

  constructor(config: AIServiceConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model;
  }

  async generateResponse(messages: AIMessage[], language: string): Promise<AIResponse> {
    try {
      // Convert messages to Anthropic format
      const formattedMessages = messages.map(msg => {
        if (msg.role === 'system') {
          // Anthropic doesn't support system messages directly, prepend to first user message
          return {
            role: 'user' as const,
            content: msg.content
          };
        }
        return {
          role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
          content: msg.content
        };
      });

      const response = await this.client.messages.create({
        model: this.model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 8000,
      });

      const content = response.content.find(c => c.type === 'text')?.text;
      if (!content) {
        throw new Error('No response from Anthropic');
      }

      // Split response into explanation and code
      const parts = content.split('```');
      const explanation = parts[0].trim();
      const code = parts.length > 1 ? parts[1].replace(/^[a-z]+\n/, '').trim() : '';

      return {
        explanation,
        code,
      };
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw error;
    }
  }
} 