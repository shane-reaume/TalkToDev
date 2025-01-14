import { Request, Response } from 'express';
import { AIServiceFactory } from '../services/ai/factory';
import { AIService, AIServiceConfig } from '../services/ai/types';

interface AIConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ChatController {
  private static instance: ChatController;
  private config: AIConfig | null = null;
  private aiService: AIService | null = null;

  private constructor() {}

  static getInstance(): ChatController {
    if (!ChatController.instance) {
      ChatController.instance = new ChatController();
    }
    return ChatController.instance;
  }

  async getAvailableModels(req: Request, res: Response) {
    try {
      const models = {
        openai: ['Examples: gpt-4, gpt-3.5-turbo, gpt-4-turbo'],
        anthropic: ['Examples: claude-3-opus-20240229, claude-3-sonnet-20240229']
      };
      res.json(models);
    } catch (error) {
      console.error('Error in getAvailableModels:', error);
      res.status(500).json({ error: 'Failed to get available models' });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { message, language, previousMessages } = req.body;

      if (!message || !language) {
        return res.status(400).json({ error: 'Message and language are required' });
      }

      if (!this.config || !this.aiService) {
        return res.status(400).json({ error: 'AI configuration not set' });
      }

      // Format system message with language context
      const systemMessage = {
        role: 'system',
        content: `You are an expert ${language} developer. Provide clear explanations and practical code examples. Format your responses with an explanation followed by a code example that demonstrates the concept.`
      };

      // Combine system message, previous messages, and current message
      const messages = [
        systemMessage,
        ...(previousMessages || []),
        { role: 'user', content: message }
      ];

      const response = await this.aiService.generateResponse(messages, language);
      res.json(response);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process message';
      res.status(500).json({ error: errorMessage });
    }
  }

  async updateConfig(req: Request, res: Response) {
    try {
      console.log('Received config update request:', JSON.stringify(req.body, null, 2));
      
      const config: AIConfig = req.body;
      
      if (!config) {
        return res.status(400).json({ error: 'Configuration is required' });
      }

      if (!config.apiKey || !config.provider || !config.model) {
        return res.status(400).json({ 
          error: 'Invalid configuration',
          details: {
            apiKey: !config.apiKey ? 'API key is required' : undefined,
            provider: !config.provider ? 'Provider is required' : undefined,
            model: !config.model ? 'Model name is required' : undefined,
          }
        });
      }

      if (!['openai', 'anthropic'].includes(config.provider)) {
        return res.status(400).json({ error: 'Invalid provider. Must be either "openai" or "anthropic"' });
      }

      // Initialize AI service with new configuration
      const serviceConfig: AIServiceConfig = {
        apiKey: config.apiKey,
        model: config.model
      };
      
      try {
        this.aiService = AIServiceFactory.getService(config.provider, serviceConfig);
        this.config = config;
        console.log('AI service initialized successfully');
        res.json({ message: 'Configuration updated successfully' });
      } catch (error) {
        console.error('Error initializing AI service:', error);
        res.status(500).json({ error: 'Failed to initialize AI service' });
      }
    } catch (error) {
      console.error('Error in updateConfig:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update configuration';
      res.status(500).json({ error: errorMessage });
    }
  }
} 