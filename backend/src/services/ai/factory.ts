import { AIService, AIServiceConfig } from './types';
import { OpenAIService } from './openai.service';
import { AnthropicService } from './anthropic.service';

export class AIServiceFactory {
  private static openAIService: OpenAIService | null = null;
  private static anthropicService: AnthropicService | null = null;

  static getService(provider: 'openai' | 'anthropic', config: AIServiceConfig): AIService {
    switch (provider) {
      case 'openai':
        if (!this.openAIService) {
          this.openAIService = new OpenAIService(config);
        }
        return this.openAIService;
      
      case 'anthropic':
        if (!this.anthropicService) {
          this.anthropicService = new AnthropicService(config);
        }
        return this.anthropicService;
      
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  static resetServices(): void {
    this.openAIService = null;
    this.anthropicService = null;
  }
} 