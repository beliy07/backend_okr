import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Queue } from 'bull';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GenerateDto, GenerationType } from './dto/generate.dto';
import { LimitsService } from './services/limits.service';

enum GenerationTaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  GENERATING_VOICE = 'GENERATING_VOICE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('generation') private readonly generationQueue: Queue,
    private readonly limitsService: LimitsService,
  ) {}

  async createTask(dto: GenerateDto, userId: string) {
    const maxLength = dto.type === GenerationType.AUDIO ? 250 : 170;
    if (dto.text.length > maxLength) {
      throw new BadRequestException(`Превышен лимит символов`);
    }

    const canGenerate = await this.limitsService.canGenerate(userId, dto.type);

    if (!canGenerate) {
      throw new BadRequestException('Достигнут лимит генерации');
    }

    const avatar = await this.prisma.avatar.findUnique({
      where: { id: dto.avatarId },
    });

    if (!avatar) {
      throw new NotFoundException();
    }

    await this.limitsService.useGeneration(userId, dto.type);

    const task = await this.prisma.generationTask.create({
      data: {
        ...dto,
        userId,
        status: GenerationTaskStatus.PENDING,
      },
      select: {
        id: true,
      },
    });

    await this.generationQueue.add('process-generation', {
      taskId: task.id,
    });

    this.logger.log(`Задача ${task.id} создана и добавлена в очередь`);
    return task;
  }

  async findAll(userId?: string) {
    return this.prisma.generationTask.findMany({
      where: {
        userId,
      },
      include: {
        avatar: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.generationTask.findUnique({
      where: { id },
      include: {
        avatar: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }
}
