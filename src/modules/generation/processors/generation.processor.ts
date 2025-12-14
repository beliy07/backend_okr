import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TelegramService } from '../../telegram/telegram.service';
import { GenerationType } from '../dto/generate.dto';
import { ElevenLabsService } from '../services/elevenlabs.service';
import { FalAiService } from '../services/fal-ai.service';

enum GenerationTaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  GENERATING_VOICE = 'GENERATING_VOICE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

interface GenerationJobData {
  taskId: string;
}

@Processor('generation')
@Injectable()
export class GenerationProcessor {
  private readonly logger = new Logger(GenerationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly elevenLabsService: ElevenLabsService,
    private readonly telegramService: TelegramService,
    private readonly falAiService: FalAiService,
  ) {}

  @Process('process-generation')
  async handleGeneration(job: Job<GenerationJobData>) {
    const { taskId } = job.data;
    this.logger.log(`Начало обработки задачи ${taskId}`);

    try {
      await this.prisma.generationTask.update({
        where: { id: taskId },
        data: { status: GenerationTaskStatus.PROCESSING },
      });

      const task = await this.prisma.generationTask.findUnique({
        where: { id: taskId },
        include: { avatar: true },
      });

      if (!task) {
        throw new Error(`Задача ${taskId} не найдена`);
      }

      await this.prisma.generationTask.update({
        where: { id: taskId },
        data: { status: GenerationTaskStatus.GENERATING_VOICE },
      });

      job.progress(25);

      const audioBuffer = await this.elevenLabsService.generateVoice(
        task.avatar.voiceId,
        task.text,
      );

      job.progress(50);

      const audioUrl = await this.falAiService.uploadFile(audioBuffer);

      await this.prisma.generationTask.update({
        where: { id: taskId },
        data: {
          audioUrl,
          status: GenerationTaskStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      job.progress(60);

      if (task.type === GenerationType.AUDIO) {
        if (task.userId) {
          await this.telegramService.sendAudio(
            task.userId,
            audioBuffer,
            '🎄 Ваше сгенерированное аудио готово!',
          );
        }

        job.progress(100);
        this.logger.log(`Задача ${taskId} завершена (аудио)`);
        return { success: true, taskId, audioUrl };
      } else {
        await this.prisma.generationTask.update({
          where: { id: taskId },
          data: {
            status: GenerationTaskStatus.GENERATING_VIDEO,
          },
        });

        job.progress(70);

        const { videoUrl } = await this.falAiService.generateLipsyncVideo(
          task.avatar.videoUrl!,
          audioUrl,
        );

        job.progress(85);

        await this.prisma.generationTask.update({
          where: { id: taskId },
          data: {
            videoUrl: videoUrl,
            status: GenerationTaskStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        if (task.userId) {
          await this.telegramService.sendVideoByUrl(
            task.userId,
            videoUrl,
            '🎄 Ваше сгенерированное видео готово!',
          );
        }

        job.progress(100);

        this.logger.log(`Задача ${taskId} завершена (видео)`);
        return { success: true, taskId, videoUrl };
      }
    } catch (error) {
      this.logger.error(`Ошибка обработки задачи ${taskId}: ${error.message}`);
      await this.prisma.generationTask.update({
        where: { id: taskId },
        data: {
          status: GenerationTaskStatus.FAILED,
          errorMessage: error.message,
        },
      });
    }
  }
}
