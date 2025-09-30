import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Groq from 'groq-sdk';

@Injectable()
export class AiProvidersService {
  private openai: OpenAI;
  private groq: Groq;

  private modelPricing = {
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-4o': { input: 2.5, output: 10 },
    'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
    'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
  };

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });

    this.groq = new Groq({
      apiKey: this.configService.get('GROQ_API_KEY'),
    });
  }

  async streamResponse(
    model: string,
    prompt: string,
    onChunk: (chunk: string, tokens: number) => void,
  ) {
    if (model.startsWith('gpt')) {
      return this.streamOpenAI(model, prompt, onChunk);
    } else if (model.startsWith('llama')) {
      return this.streamGroq(model, prompt, onChunk);
    }
    throw new Error(`Unsupported model: ${model}`);
  }

  private async streamOpenAI(
    model: string,
    prompt: string,
    onChunk: (chunk: string, tokens: number) => void,
  ) {
    const stream = await this.openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      stream_options: { include_usage: true },
    });

    let totalTokens = 0;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (chunk.usage) {
        totalTokens = chunk.usage.total_tokens;
      }
      if (content) {
        onChunk(content, totalTokens);
      }
    }
  }

  private async streamGroq(
    model: string,
    prompt: string,
    onChunk: (chunk: string, tokens: number) => void,
  ) {
    const stream = await this.groq.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    let totalTokens = 0;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      
      if (chunk.x_groq?.usage) {
        totalTokens = chunk.x_groq.usage.total_tokens;
      }
      
      if (content) {
        onChunk(content, totalTokens);
      }
    }
  }

  calculateCost(model: string, tokens: number): number {
    const pricing = this.modelPricing[model];
    if (!pricing) return 0;

    const outputTokens = Math.floor(tokens * 0.75);
    const inputTokens = tokens - outputTokens;

    const cost =
      (inputTokens / 1000000) * pricing.input +
      (outputTokens / 1000000) * pricing.output;

    return parseFloat(cost.toFixed(6));
  }

  getAvailableModels() {
    return [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        pricing: this.modelPricing['gpt-4o-mini'],
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        pricing: this.modelPricing['gpt-4o'],
      },
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        provider: 'Groq',
        pricing: this.modelPricing['llama-3.3-70b-versatile'],
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B',
        provider: 'Groq',
        pricing: this.modelPricing['llama-3.1-8b-instant'],
      },
    ];
  }
}