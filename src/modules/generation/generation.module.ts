import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TelegramModule } from '../telegram/telegram.module';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { GenerationProcessor } from './processors/generation.processor';
import { ElevenLabsService } from './services/elevenlabs.service';
import { FalAiService } from './services/fal-ai.service';
import { LimitsService } from './services/limits.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'generation',
    }),
    TelegramModule,
  ],
  controllers: [GenerationController],
  providers: [
    GenerationService,
    GenerationProcessor,
    ElevenLabsService,
    FalAiService,
    LimitsService,
  ],
  exports: [GenerationService, LimitsService],
})
export class GenerationModule {}
