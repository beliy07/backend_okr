import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class LimitsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateUserLimits(userId: string) {
    let limits = await this.prisma.userLimits.findUnique({
      where: { userId },
    });

    if (!limits) {
      limits = await this.prisma.userLimits.create({
        data: {
          userId,
        },
      });
    }

    return limits;
  }

  async getUserLimits(userId: string) {
    const limits = await this.getOrCreateUserLimits(userId);
    return {
      audio: limits.audio,
      video: limits.video,
    };
  }

  async canGenerate(userId: string, type: 'AUDIO' | 'VIDEO') {
    const limits = await this.getOrCreateUserLimits(userId);
    return type === 'AUDIO' ? limits.audio > 0 : limits.video > 0;
  }

  async useGeneration(userId: string, type: 'AUDIO' | 'VIDEO') {
    const limits = await this.getOrCreateUserLimits(userId);

    if (type === 'AUDIO' && limits.audio > 0) {
      await this.prisma.userLimits.update({
        where: { userId },
        data: { audio: { decrement: 1 } },
      });
    } else if (type === 'VIDEO' && limits.video > 0) {
      await this.prisma.userLimits.update({
        where: { userId },
        data: { video: { decrement: 1 } },
      });
    }
  }
}
