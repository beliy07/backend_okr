import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AvatarsModule } from '../modules/avatars/avatars.module';
import { GenerationModule } from '../modules/generation/generation.module';
import { TelegramModule } from '../modules/telegram/telegram.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          redis: configService.getOrThrow<string>('REDIS_URI'),
        };
      },
      inject: [ConfigService],
    }),

    PrismaModule,
    RedisModule,
    AvatarsModule,
    TelegramModule,
    GenerationModule,
  ],
})
export class CoreModule {}
