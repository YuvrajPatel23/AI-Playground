import { IsString, IsArray, IsNotEmpty, MinLength } from 'class-validator';

export class CreateComparisonDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  prompt: string;

  @IsArray()
  @IsNotEmpty()
  models: string[];
}

export interface ComparisonResult {
  sessionId: string;
  prompt: string;
  models: string[];
  createdAt: Date;
}

export interface ModelResponse {
  model: string;
  response: string;
  tokensUsed: number;
  timeTaken: number;
  cost: number;
  status: 'streaming' | 'complete' | 'error';
  error?: string;
}