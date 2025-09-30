import { Controller, Post, Body, Sse, Param, Get } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ComparisonService } from './comparison.service';
import { CreateComparisonDto } from './dto/comparison.dto';

@Controller('api/comparison')
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Post('start')
  async startComparison(@Body() dto: CreateComparisonDto) {
    return this.comparisonService.createSession(dto);
  }

  @Sse('stream/:sessionId')
  streamComparison(@Param('sessionId') sessionId: string): Observable<any> {
    return this.comparisonService.streamResponses(sessionId);
  }

  @Get('models/available')
  getAvailableModels() {
    return this.comparisonService.getAvailableModels();
  }

  @Get('sessions')
  getAllSessions() {
    return this.comparisonService.getAllStoredSessions();
  }

  @Get('sessions/:sessionId')
  getSession(@Param('sessionId') sessionId: string) {
    return this.comparisonService.getSession(sessionId);
  }
}