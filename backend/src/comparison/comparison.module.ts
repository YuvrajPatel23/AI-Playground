import { Module } from '@nestjs/common';
import { ComparisonController } from './comparison.controller';
import { ComparisonService } from './comparison.service';
import { AiProvidersService } from './ai-providers.service';
import { StorageService } from './storage.service';

@Module({
  controllers: [ComparisonController],
  providers: [ComparisonService, AiProvidersService, StorageService],
})
export class ComparisonModule {}