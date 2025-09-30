import { Injectable, NotFoundException } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AiProvidersService } from './ai-providers.service';
import { StorageService } from './storage.service';
import { CreateComparisonDto, ComparisonResult } from './dto/comparison.dto';

@Injectable()
export class ComparisonService {
  private activeStreams = new Map<string, Subject<any>>();

  constructor(
    private aiProviders: AiProvidersService,
    private storage: StorageService,
  ) {}

  async createSession(dto: CreateComparisonDto): Promise<ComparisonResult> {
    const sessionId = uuidv4();
    const session: ComparisonResult = {
      sessionId,
      prompt: dto.prompt,
      models: dto.models,
      createdAt: new Date(),
    };

    this.storage.saveSession(session);
    this.startStreaming(sessionId, dto.prompt, dto.models);

    return session;
  }

  streamResponses(sessionId: string): Observable<any> {
    const stream = this.activeStreams.get(sessionId);
    if (!stream) {
      throw new NotFoundException('Session not found');
    }
    return stream.asObservable();
  }

  private async startStreaming(
    sessionId: string,
    prompt: string,
    models: string[],
  ) {
    const stream = new Subject<any>();
    this.activeStreams.set(sessionId, stream);

    models.forEach((model) => {
      stream.next({
        data: JSON.stringify({
          model,
          status: 'typing',
          chunk: '',
        }),
      });
    });

    const promises = models.map(async (model) => {
      try {
        const startTime = Date.now();
        let fullResponse = '';
        let tokensUsed = 0;

        stream.next({
          data: JSON.stringify({
            model,
            status: 'streaming',
            chunk: '',
          }),
        });

        await this.aiProviders.streamResponse(
          model,
          prompt,
          (chunk, tokens) => {
            fullResponse += chunk;
            tokensUsed = tokens;

            stream.next({
              data: JSON.stringify({
                model,
                status: 'streaming',
                chunk,
                fullResponse,
              }),
            });
          },
        );

        const timeTaken = Date.now() - startTime;
        const cost = this.aiProviders.calculateCost(model, tokensUsed);

        stream.next({
          data: JSON.stringify({
            model,
            status: 'complete',
            fullResponse,
            tokensUsed,
            timeTaken,
            cost,
          }),
        });

        this.storage.saveResponse(sessionId, {
          model,
          response: fullResponse,
          tokensUsed,
          timeTaken,
          cost,
          status: 'complete',
        });
      } catch (error) {
        stream.next({
          data: JSON.stringify({
            model,
            status: 'error',
            error: error.message,
          }),
        });
      }
    });

    await Promise.all(promises);
    stream.complete();
    this.activeStreams.delete(sessionId);
  }

  getAvailableModels() {
    return this.aiProviders.getAvailableModels();
  }

  getAllStoredSessions() {
    return this.storage.getAllSessions();
  }

  getSession(sessionId: string) {
    return this.storage.getSession(sessionId);
  }
}